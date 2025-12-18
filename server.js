const { PrismaClient } = require("@prisma/client");
const express = require("express");
const app = express();

app.use(express.json())

const PORT = 8000;

const prisma = new PrismaClient();


app.listen(PORT, () => { 
    console.log("サーバーを起動中・・・")
})

app.post("/",async (req,res) => {
    //reqはこの形で送ることにする
    const {title,body} = req.body;

    //
    const posts = await prisma.posts.create({
        data: {
            title: title,
            body: body,
        },
    });
    return res.json(posts);
})