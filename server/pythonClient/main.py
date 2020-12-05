from pprint import pprint
import sys
import time
import bson
import json

import client
from packet import Packet

class kakaoClient(client.Client):

    async def onMessage(self, chat):
        print(chat.__dict__)
        print()
        print(chat.channel.__dict__)
        print()
        print(chat.message)
        print()
        
        await chat.channel.sendText('test')
        #chat.channel.sendChat(self, msg, extra, t):
        #chat.channel.sendText(self, msg):
        

        if chat.message == "와":
            await chat.reply("샌주")
        
client = kakaoClient("SERVER", "c2VydmVyMQ==")
client.run("luftaquila@protonmail.ch", "rokaFKAk512#")

'''
{
    'channel': {
        'chatId': 184830542711986,
        'li': 0,
        'writer': {
            'crypto': <cryptoManager.CryptoManager object at 0xb6445df0>,
            'StreamWriter': <StreamWriter transport=<_SelectorSocketTransport fd=6 read=polling write=<idle, bufsize=0>> reader=<StreamReader waiter=<Future pending cb=[<TaskWakeupMethWrapper object at 0xb6456e68>()]> transport=<_SelectorSocketTransport fd=6 read=polling write=<idle, bufsize=0>>>>,
            'PacketID': 1,
            'PacketDict': {}
        }
    },
    'rawBody': {
        'status': 0,
        'errMsg': None,
        'errUrl': None,
        'errUrlLabel': None,
        'traceId': 0,
        'chatId': 184830542711986,                     # 각 채팅별 고유 ID인 듯
        'logId': 2400765282257625088,                  # 각 메시지별 고유 ID
        'authorNickname': '오병준',
        'chatLog': {
            'logId': 2400765282257625088,              # 각 메시지별 고유 ID
            'chatId': 184830542711986,                 # 각 채팅창별 고유 ID인 듯
            'type': 1,
            'authorId': 246786864,                     # 작성자 고유 ID
            'message': 'rd',                           # 메시지 내용
            'sendAt': 1607130723,                      # Epoch in seconds.
            'attachment': '{}',                        # 아마 첨부파일?
            'msgId': 813030064,
            'prevId': 2400765137579302912              # 이전 메시지 고유 ID
        },
        'noSeen': False                                # 읽었는지 여부인 듯
    },
    'logId': 2400765282257625088,                      # 각 메시지별 고유 ID
    'type': 1,
    'message': 'rd',
    'msgId': 813030064,                                # 이것도 메시지마다 다 다름.
    'authorId': 246786864,
    'attachment': {},
    'nickName': '오병준'
}
'''
'''
{'channel': <channel.Channel object at 0xb648ffd0>, 'rawBody': {'status': 0, 'errMsg': None, '
errUrl': None, 'errUrlLabel': None, 'traceId': 0, 'chatId': 174726625044834, 'logId': 24008121
24999688193, 'authorNickname': '오병준', 'chatLog': {'logId': 2400812124999688193, 'chatId': 1747
26625044834, 'type': 1, 'authorId': 246786864, 'message': '나 테스트좀만 할게 대충 내가 보내는거 무시해', 'sendAt
': 1607136307, 'attachment': '{}', 'msgId': 818614164, 'prevId': 2400430731350138881}, 'noSeen
': False}, 'logId': 2400812124999688193, 'type': 1, 'message': '나 테스트좀만 할게 대충 내가 보내는거 무시해', 'm
sgId': 818614164, 'authorId': 246786864, 'attachment': {}, 'nickName': '오병준'}
'''