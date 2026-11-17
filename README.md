# SmartEnergy: IoT Energy Monitoring and Control

SmartEnergy is a web app to watch how much power the devices in a home are using and to switch them on and off remotely. It was my final-year project for my BS in Software Engineering at CECOS University, Peshawar.

The idea is that an ESP32 with current/voltage sensors and a relay board sits on each circuit. It sends a reading to the server every few seconds and the dashboard updates live. There's also a virtual microcontroller that behaves like the ESP32 and sends realistic readings, so the whole system can run on one laptop without any hardware.

## What it does

- **Live dashboard:** voltage, current, power, energy, frequency and power factor for each device, updated over WebSocket.
- **Remote control:** turn a whole device on or off, or switch single relay channels. There are also scenes and quick actions that switch several things at once.
- **Alerts:** set your own rules (for example power above 1000 W, or voltage below 210 V) with a severity. When a reading crosses your power limit, an alert is created automatically.
- **Schedules:** turn relays on and off at set times on chosen days.
- **Analytics:** hourly, weekly and monthly usage, usage per device, this period vs last period, and how many times limits were crossed.
- **Cost calculator:** flat rate, time-of-use and tiered tariffs.
- **Reports and history:** export data by day, device, alerts or month, and see a log of everything that happened.
- **Accounts:** register and log in with JWT, change your profile and password, and generate an API key.

## Tech

- **Frontend:** React 18, Vite, Recharts, react-icons
- **Backend:** Node.js, Express, MongoDB with Mongoose, WebSocket (`ws`)
- **Security:** JWT, bcrypt, Helmet, rate limiting (300 requests per 15 minutes)
- **Hardware:** ESP32 with sensors and a 4-channel relay, or the virtual controller

## How it fits together

```
ESP32 / virtual controller --POST /api/readings--> Express API --> MongoDB
                                                       |
                                                  WebSocket
                                                       |
                                               React dashboard
```

1. The device sends a reading to `POST /api/readings`.
2. The server saves it, updates the device's latest values and checks the user's alert limit.
3. The server pushes the new data to every open dashboard over WebSocket, so nothing has to refresh.
4. When you flip a switch in the dashboard, the API updates the relay and broadcasts the new state back to the device.

## Project structure

```
client/                 React dashboard
  src/pages/            Dashboard, Devices, Control, Realtime data, Analytics,
                        Alerts, Schedules, Cost calculator, Reports, History, Settings
  src/services/api.js   all API and WebSocket calls in one place
  src/context/          shared dashboard state

server/                 Express API
  routes/               auth, devices, readings, alerts, schedules, history, analytics
  controllers/          the logic for each route
  models/               User, Device, Reading, Alert, AlertRule, Schedule, HistoryEvent
  utils/seed.js         demo user, 6 devices, alert rules and sample data

hardware/               virtual microcontroller
```

## Running it

You need Node.js 18+ and MongoDB running locally.

**Server**

```bash
cd server
npm install
cp .env.example .env      # set MONGO_URI and a long JWT_SECRET
npm run seed              # optional: demo user and devices
npm run dev               # http://localhost:5000
```

**Client**

```bash
cd client
npm install
npm run dev               # http://localhost:3000
```

If the API runs somewhere else, set `VITE_API_URL` and `VITE_WS_URL` in `client/.env`.

After seeding you can log in with `asif@smartenergy.com` / `admin123`.

## What I'd add next

- MQTT between the ESP32 and the server instead of HTTP posts
- Charts that compare usage with the electricity bill
- Tests for the API
