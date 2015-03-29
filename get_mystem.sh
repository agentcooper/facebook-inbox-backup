# Mystem

if [ -f "./bin/mystem" ]
then
  echo "Mystem found in ./bin"
else
  echo 'Downloading Mystem from https://tech.yandex.ru/mystem/'

  curl -o mystem.tar.gz -L http://download.cdn.yandex.net/mystem/mystem-3.0-macosx10.8.tar.gz

  mkdir -p ./bin
  tar -zxvf mystem.tar.gz -C ./bin
  rm mystem.tar.gz
fi
