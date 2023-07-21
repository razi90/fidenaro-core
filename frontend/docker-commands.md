# build container
docker build -t fidenaro-ui .
# run container in a way it also recongnize changes
docker run -p 3000:3000 -v ${PWD}:/app -v /app/node_modules -e CHOKIDAR_USEPOLLING=true fidenaro-ui
# stop all running container
docker stop $(docker ps -q)