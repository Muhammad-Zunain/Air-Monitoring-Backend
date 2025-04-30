import express from "express"
import cors from "cors"



const app = express()


app.use(cors({
    origin: "*"
}));

app.use(express.json())
app.use(express.urlencoded({
    extended: true,
    limit: "16kb"
}))
app.use(express.static("public"))

app.get('/', async (req, res)=>{
    res.json("HELLO")
})

//Routes
import airMonitoringRouter from './routes/airMonitoring.route.js'

app.use('/api/air-monitoring', airMonitoringRouter);

export { app };
