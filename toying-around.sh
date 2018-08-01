FIFA_URL='https://api.fifa.com/api/v1'
NOW_URL='/live/football/now'

echo $FIFA_URL$NOW_URL
response=$(curl $FIFA_URL$NOW_URL)
echo $response | jq '.Results' > response.json