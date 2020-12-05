import httpApi

user_id = 'luftaquila@protonmail.ch' #str(input("ID: "))
user_pw = 'rokaFKAk512#' #str(input("PW: "))

device_name = "SERVER"
user_uuid = "c2VydmVyMQ=="

httpApi.RequestPasscode(user_id, user_pw, device_name, user_uuid)

passcode = str(input("Input Passcode : "))

res = httpApi.RegisterDevice(user_id, user_pw, device_name, user_uuid, passcode)
print(res)

res = httpApi.Login(user_id, user_pw, device_name, user_uuid)
print(res)