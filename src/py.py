
import json
import base64
from io import BytesIO
import asyncio
from websockets.asyncio.server import serve

async def echo(websocket):
   async for message in websocket:
        await websocket.send(message)
async def main():
    print("server run")
    async with serve(echo, "localhost", 8765):
        await asyncio.get_running_loop().create_future()  # run forever

asyncio.run(main())
