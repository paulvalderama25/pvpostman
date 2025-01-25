const {Client}=require('pg');
const express = require("express");
const cors = require('cors');

const app = express();
app.use(express.json());

app.use(cors());

const { createProxyMiddleware } = require('http-proxy-middleware');

app.use('/api', createProxyMiddleware({
    target: 'http://localhost:8080/', //original url
    changeOrigin: true,
    //secure: false,
    onProxyRes: function (proxyRes, req, res) {
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    }
}))

const con=new Client({
    host: "localhost",
    user: "postgres",
    port: 5433,
    password: "postgres25",
    database: "postgres"
})

con.connect().then(() => console.log("connected"))

app.post('/postData', (req, res) => {req
    const {name,email,id} = req.body

    console.log(name, email, id, 'server data')

    const insert_query='INSERT INTO customers (name,email,id) VALUES ($1,$2,$3)'

    con.query(insert_query,[name,email,id], (err, result) => {
        if(err){
            res.send(err)
        } else {
            console.log(result)
            res.send("POSTED DATA")
        }
    })

})


app.get("/fetchData", (req, res) => {

    const fetch_query = 'SELECT * FROM public.customers'

    con.query(fetch_query, (err, result)=> {
        if(err){
            res.send(err)
        } else {
            res.send(result.rows)
        }
    })
});

app.put('/update/:id', (req, res) => {
    const id = req.params.id;
    const name = req.body.name;
    const email = req.body.email;
    // const {name,email,id} = req.body

    const update_query = "UPDATE customers SET name=$1,email=$2 WHERE id=$3"

    con.query(update_query,[name, email, id],(err,result)=>{
        if(err){
            console.log(err, 'whats results')
            res.send(err)
        }else{
            res.send("Updated")
        }
    })
})

app.delete('/delete/:id', (req,res)=>{
    const id = req.params.id;
    const delete_query = "DELETE from customers WHERE id = $1"
    con.query(delete_query,[id], (err, result) => {
        if(err){
            res.send(err);
        } else {
            res.send(result);
        }
    })
})

const PORT = 8080;

app.listen(PORT,
    console.log(`Server started on port ${PORT}`)
);
