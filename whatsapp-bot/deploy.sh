current_branch=$(git rev-parse --abbrev-ref HEAD)

if [ "$current_branch" != "main" ]; then
  echo "Warning: You are not on the main branch. Deployment aborted."
  exit 1
fi

echo "Removing files..."
ssh ec2-13-39-21-106.eu-west-3.compute.amazonaws.com 'sudo rm -r -f /home/ubuntu/birthday-bot/src'
ssh  ec2-13-39-21-106.eu-west-3.compute.amazonaws.com 'sudo rm -f /home/ubuntu/birthday-bot/package.json'
ssh  ec2-13-39-21-106.eu-west-3.compute.amazonaws.com 'sudo rm -f /home/ubuntu/birthday-bot/package-lock.json'
ssh  ec2-13-39-21-106.eu-west-3.compute.amazonaws.com 'sudo rm -f /home/ubuntu/birthday-bot/node_modules'
ssh  ec2-13-39-21-106.eu-west-3.compute.amazonaws.com 'sudo rm -f /home/ubuntu/birthday-bot/dist'
ssh  ec2-13-39-21-106.eu-west-3.compute.amazonaws.com 'sudo rm -f /home/ubuntu/birthday-bot/.env'
ssh  ec2-13-39-21-106.eu-west-3.compute.amazonaws.com 'sudo rm -f /home/ubuntu/birthday-bot/tsconfig.json'

echo "Files removed. Copying new files..."
scp package.json ec2-13-39-21-106.eu-west-3.compute.amazonaws.com:/home/ubuntu/birthday-bot
scp package-lock.json ec2-13-39-21-106.eu-west-3.compute.amazonaws.com:/home/ubuntu/birthday-bot
scp .env.prod  ec2-13-39-21-106.eu-west-3.compute.amazonaws.com:/home/ubuntu/birthday-bot/.env
scp tsconfig.json  ec2-13-39-21-106.eu-west-3.compute.amazonaws.com:/home/ubuntu/birthday-bot/tsconfig.json
rsync -av src  ec2-13-39-21-106.eu-west-3.compute.amazonaws.com:/home/ubuntu/birthday-bot

echo "Files copied! Installing packages..."
ssh  ec2-13-39-21-106.eu-west-3.compute.amazonaws.com 'cd /home/ubuntu/birthday-bot; npm i'

echo "Packages installed. Building..."
ssh  ec2-13-39-21-106.eu-west-3.compute.amazonaws.com 'cd /home/ubuntu/birthday-bot; npm run build'

echo "Built!"