import asyncio
import aiohttp
import sys

CLASS_ID = "184236b5-500f-462d-b5d5-51412f2f4342"

async def send_request(session, student):
    port = 5101 if student % 2 else 5102
    url = f"http://localhost:{port}/classes/{CLASS_ID}/holds"
    headers = {"X-Student-Id": f"bonus-student-{student}"}

    try:
        async with session.post(url, headers=headers) as response:
            return {
                "student": student,
                "backend": port,
                "status": response.status
            }
    except Exception as error:
        return {
            "student": student,
            "backend": port,
            "status": f"ERROR: {error}"
        }

async def main():
    async with aiohttp.ClientSession() as session:
        results = await asyncio.gather(
            *(send_request(session, student) for student in range(1, 11))
        )

    for result in sorted(results, key=lambda x: x["student"]):
        print(result)

    print("\nSummary:")
    print("201 Created:", sum(r["status"] == 201 for r in results))
    print("409 Conflict:", sum(r["status"] == 409 for r in results))

asyncio.run(main())

