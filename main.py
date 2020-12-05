import client
from packet import Packet
import bson
import time
import json

class MyClass(client.Client):

    async def onMessage(self, chat):
        
        print(chat)

        if chat.message == "와":
            await chat.reply("샌주")
        
client = MyClass("SERVER", "c2VydmVyMQ==")
client.run("luftaquila@protonmail.ch", "rokaFKAk512#")
