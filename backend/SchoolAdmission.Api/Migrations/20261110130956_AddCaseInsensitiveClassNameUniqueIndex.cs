using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SchoolAdmission.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddCaseInsensitiveClassNameUniqueIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
   migrationBuilder.Sql("""
        CREATE UNIQUE INDEX "IX_Classes_Name_Lower"
        ON "Classes" (LOWER(TRIM("Name")));
        """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
   migrationBuilder.Sql("""
        DROP INDEX IF EXISTS "IX_Classes_Name_Lower";
        """);
        }
    }
}
