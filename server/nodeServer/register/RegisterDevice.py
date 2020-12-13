import httpApi

user_id = str(input("ID: "))
user_pw = str(input("PW: "))

device_name = str(input("DEVICE NAME: "))
user_uuid = str(input("DEVICE UUID(B64): "))

httpApi.RequestPasscode(user_id, user_pw, device_name, user_uuid)

passcode = str(input("Input Passcode : "))

res = httpApi.RegisterDevice(user_id, user_pw, device_name, user_uuid, passcode)
print(res)

res = httpApi.Login(user_id, user_pw, device_name, user_uuid)
print(res)

'''
{
  "status":0,
  "userId":246786864,
  "countryIso":"KR",
  "countryCode":"82",
  "accountId":97954701,
  "server_time":1607222527,
  "resetUserData":false,
  "access_token":"3080a561f69c47bc80b68f3e72f8c78800000016072116486120020durQXyg11J",
  "refresh_token":"62a98adc18d643129e261d1ef18f3e2800000016072116486120020rpBGTzTixz-CBrS2Q",
  "token_type":"bearer",
  "autoLoginAccountId":"luftaquila@protonmail.ch",
  "displayAccountId":"luftaquila@protonmail.ch",
  "mainDeviceAgentName":"android",
  "mainDeviceAppVersion":"9.1.3"
}
'''