echo "wait db server"
dockerize -wait tcp://mysqldb:3306 -timeout 10s

echo "start node server"
npm run start