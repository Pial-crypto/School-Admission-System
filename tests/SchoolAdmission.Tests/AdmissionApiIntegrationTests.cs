
using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SchoolAdmission.Api.Data;
using Testcontainers.PostgreSql;
using Xunit;

namespace SchoolAdmission.Tests;

public class AdmissionApiIntegrationTests : IAsyncLifetime
{
    private PostgreSqlContainer _postgres = null!;
    private WebApplicationFactory<Program> _factory = null!;
    private HttpClient _client = null!;

  

    public async Task InitializeAsync()
    {
        // Create a dedicated PostgreSQL container for this test.
        _postgres = new PostgreSqlBuilder()
            .WithImage("postgres:16")
            .WithDatabase("school_admission_test")
            .WithUsername("postgres")
            .WithPassword("test_password")
            .Build();

        await _postgres.StartAsync();


        _factory = new WebApplicationFactory<Program>()
            .WithWebHostBuilder(builder =>
            {
                builder.UseEnvironment("Testing");

                builder.ConfigureAppConfiguration((_, configuration) =>
                {
                    configuration.AddInMemoryCollection(
                        new Dictionary<string, string?>
                        {
                            ["ConnectionStrings:DefaultConnection"] =
                                _postgres.GetConnectionString(),

                            ["HoldDurationSeconds"] = "600"
                        });
                });
            });

        _client = _factory.CreateClient();

     
  await using var scope = _factory.Services.CreateAsyncScope();

var db = scope.ServiceProvider
    .GetRequiredService<ApplicationDbContext>();


await db.Database.EnsureDeletedAsync();


await db.Database.MigrateAsync();
    }

   
    public async Task DisposeAsync()
    {
        _client?.Dispose();

        if (_factory != null)
            await _factory.DisposeAsync();

        if (_postgres != null)
            await _postgres.DisposeAsync();
    }


    private async Task<Guid> CreateClassAsync(
        string name,
        int totalSeats)
    {
     
        var uniqueName = $"{name}-{Guid.NewGuid():N}";

        var response = await _client.PostAsJsonAsync(
            "/classes",
            new
            {
                name = uniqueName,
                totalSeats
            });

        Assert.Equal(
            HttpStatusCode.Created,
            response.StatusCode);

        using var json = await JsonDocument.ParseAsync(
            await response.Content.ReadAsStreamAsync());

        return json.RootElement
            .GetProperty("id")
            .GetGuid();
    }

  

    private async Task<HttpResponseMessage> CreateHoldAsync(
        Guid classId,
        string studentId)
    {
        using var request = new HttpRequestMessage(
            HttpMethod.Post,
            $"/classes/{classId}/holds");

        request.Headers.Add("X-Student-Id", studentId);

        return await _client.SendAsync(request);
    }

   

    private async Task<HttpResponseMessage> ConfirmHoldAsync(
        Guid holdId,
        string studentId)
    {
        using var request = new HttpRequestMessage(
            HttpMethod.Post,
            $"/holds/{holdId}/confirm");

        request.Headers.Add("X-Student-Id", studentId);

        return await _client.SendAsync(request);
    }

 
    [Fact]
    public async Task CreatingHold_ShouldReduceAvailableSeats()
    {
       
        var classId = await CreateClassAsync(
            "Class One",
            totalSeats: 2);

       
        using var holdResponse = await CreateHoldAsync(
            classId,
            "student-001");

        Assert.Equal(
            HttpStatusCode.Created,
            holdResponse.StatusCode);

        using var classResponse = await _client.GetAsync(
            $"/classes/{classId}");

        classResponse.EnsureSuccessStatusCode();

        using var json = await JsonDocument.ParseAsync(
            await classResponse.Content.ReadAsStreamAsync());

        var heldSeats = json.RootElement
            .GetProperty("heldSeats")
            .GetInt32();

        var availableSeats = json.RootElement
            .GetProperty("availableSeats")
            .GetInt32();

        Assert.Equal(1, heldSeats);
        Assert.Equal(1, availableSeats);
    }

  

    [Fact]
    public async Task ConfirmingSameHoldTwice_ShouldCountOnlyOneConfirmedSeat()
    {
       
        var classId = await CreateClassAsync(
            "Class Two",
            totalSeats: 2);

        using var holdResponse = await CreateHoldAsync(
            classId,
            "student-002");

        Assert.Equal(
            HttpStatusCode.Created,
            holdResponse.StatusCode);

        using var holdJson = await JsonDocument.ParseAsync(
            await holdResponse.Content.ReadAsStreamAsync());

        var holdId = holdJson.RootElement
            .GetProperty("holdId")
            .GetGuid();

        using var firstConfirmation = await ConfirmHoldAsync(
            holdId,
            "student-002");

        using var secondConfirmation = await ConfirmHoldAsync(
            holdId,
            "student-002");

        Assert.Equal(
            HttpStatusCode.OK,
            firstConfirmation.StatusCode);

        Assert.Equal(
            HttpStatusCode.OK,
            secondConfirmation.StatusCode);

        using var classResponse = await _client.GetAsync(
            $"/classes/{classId}");

        classResponse.EnsureSuccessStatusCode();

        using var classJson = await JsonDocument.ParseAsync(
            await classResponse.Content.ReadAsStreamAsync());

        var confirmedSeats = classJson.RootElement
            .GetProperty("confirmedSeats")
            .GetInt32();

        var availableSeats = classJson.RootElement
            .GetProperty("availableSeats")
            .GetInt32();

        Assert.Equal(1, confirmedSeats);
        Assert.Equal(1, availableSeats);
    }



    [Fact]
    public async Task ConcurrentHoldRequests_ShouldNeverExceedClassCapacity()
    {
      
        const int capacity = 3;
        const int numberOfStudents = 10;

        var classId = await CreateClassAsync(
            "Class Three",
            capacity);

  
        var requests = Enumerable.Range(1, numberOfStudents)
            .Select(studentNumber =>
                CreateHoldAsync(
                    classId,
                    $"student-{studentNumber:D3}"));

       
        var responses = await Task.WhenAll(requests);

        try
        {
           
            var successfulRequests = responses.Count(response =>
                response.StatusCode == HttpStatusCode.Created);

     
            var rejectedRequests = responses.Count(response =>
                response.StatusCode == HttpStatusCode.Conflict);

         
            Assert.Equal(capacity, successfulRequests);

           
            Assert.Equal(
                numberOfStudents - capacity,
                rejectedRequests);

   
            using var classResponse = await _client.GetAsync(
                $"/classes/{classId}");

            classResponse.EnsureSuccessStatusCode();

            using var json = await JsonDocument.ParseAsync(
                await classResponse.Content.ReadAsStreamAsync());

            var heldSeats = json.RootElement
                .GetProperty("heldSeats")
                .GetInt32();

            var availableSeats = json.RootElement
                .GetProperty("availableSeats")
                .GetInt32();

            // Database must respect the class capacity.
            Assert.Equal(capacity, heldSeats);
            Assert.Equal(0, availableSeats);

            Assert.True(
                heldSeats <= capacity,
                "Held seats must never exceed class capacity.");
        }
        finally
        {
           
            foreach (var response in responses)
            {
                response.Dispose();
            }
        }
    }
}
