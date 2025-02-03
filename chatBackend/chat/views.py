from django.shortcuts import render
from django.http import JsonResponse
import json
from django.views.decorators.csrf import csrf_exempt
from django.core.cache import cache
import random

def generate_roomId():
    return random.randint(10000,99999)


@csrf_exempt
def create_room(request):
    if request.method == "POST":
        try:
            data  = json.loads(request.body)
            username = data.get("username","")
            room_id = generate_roomId()
            cache.set(f"room_{room_id}", room_id, timeout=1000)
            context = {
                "status":"success",
                "username":username,
                "roomid":room_id,
            }

            print(f"Received: {context}")
            return JsonResponse(context)
        except json.JSONDecodeError:
            return JsonResponse({"status": "error", "message": "Invalid JSON"}, status=400)
    return JsonResponse({"status": "error", "message": "Only POST method allowed"}, status=405)

@csrf_exempt
def join_room(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            username = data.get("username")
            room_id = data.get("room_id")
            room = cache.get(room_id)

            context = {
                "status":"success",
                "username":username,
                "roomid":room_id
            }
            print(f"Received: {context}")
            return JsonResponse(context)
        except json.JSONDecodeError:
            return JsonResponse({"status": "error", "message": "Invalid JSON"}, status=400)
    return JsonResponse({"status": "error", "message": "Only POST method allowed"}, status=405)


