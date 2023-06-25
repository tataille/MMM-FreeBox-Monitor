#!/bin/sh

sudo mkdir -p /opt/magic_mirror/modules/MMM-FreeBox-Monitor
sudo cp /tmp/MMM-FreeBox-Monitor/* /opt/magic_mirror/modules/MMM-FreeBox-Monitor
cd /opt/magic_mirror/modules/MMM-FreeBox-Monitor
sudo npm install
cd /opt/magic_mirror
