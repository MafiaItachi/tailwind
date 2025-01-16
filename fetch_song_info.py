import requests

def extract_song_info_lastfm(youtube_url, api_key):
    try:
        # Extract the video ID from the URL
        video_id = youtube_url.split("v=")[1].split("&")[0]
        
        # Get the video title from YouTube API (you can keep your existing YouTube API part)
        video_title = get_video_title_from_youtube(youtube_url, api_key)  # Assuming you have your API key

        if video_title:
            # Use the Last.fm API to search for the song details based on the video title
            lastfm_url = "http://ws.audioscrobbler.com/2.0/"
            params = {
                'method': 'track.search',
                'track': video_title,
                'api_key': api_key,
                'format': 'json'
            }
            response = requests.get(lastfm_url, params=params)
            data = response.json()

            if data['results']['trackmatches']['track']:
                track_info = data['results']['trackmatches']['track'][0]  # Get the first match
                artist = track_info['artist']
                song_title = track_info['name']
                return artist.strip(), song_title.strip()
            else:
                print("Song not found in Last.fm.")
                return None, None
        else:
            print("Could not retrieve video title.")
            return None, None
    except Exception as e:
        print(f"Error: {e}")
        return None, None

def get_video_title_from_youtube(youtube_url, api_key):
    from googleapiclient.discovery import build

    try:
        # Extract the video ID from the URL
        video_id = youtube_url.split("v=")[1].split("&")[0]
        
        youtube = build('youtube', 'v3', developerKey=api_key)
        request = youtube.videos().list(part="snippet", id=video_id)
        response = request.execute()

        if response["items"]:
            return response["items"][0]["snippet"]["title"]
        else:
            print("Video not found on YouTube.")
            return None
    except Exception as e:
        print(f"Error: {e}")
        return None

# Example usage
youtube_url = "https://youtube.com/watch?v=RVDCeVG90Rg&list=RDAMVMRVDCeVG90Rg"  # Replace with a valid link
lastfm_api_key = "30a78da9faab294301d4279adca4c799"  # Replace with your Last.fm API key
youtube_api_key = "AIzaSyCvg75UUMA46CjILnhTcRcQVnxzmPDaRCU"  # Replace with your YouTube API key

artist, song = extract_song_info_lastfm(youtube_url, lastfm_api_key)
print(f"Artist: {artist}, Song: {song}")

