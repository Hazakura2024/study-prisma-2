require('dotenv').config();

/**
 * これまでの Prisma (v6以前):** 実行時に Rust で書かれた巨大なバイナリ（Query Engine）を動かしていました。このバイナリの中に DB 接続用のドライバーが含まれていましたが、環境ごとにバイナリを落とし直す必要があり、ファイルサイズも大きい（サーバーレスや Edge で不利）という課題がありました。
 * 
 * Prisma 7:** Rust バイナリを使わず、クエリの構築（SQL 生成）をより軽量な仕組みで行い、
 * 実際の DB への問い合わせは `pg` などの **Node.js 標準のライブラリ**に任せるようになりました。
 */


// Prisma のメインクラスをインポート。DB操作（データの取得・保存など）を行うための中心的なオブジェクトです。
const { PrismaClient } = require("@prisma/client");

// PostgreSQL 専用のアダプターをインポート。Prisma と後述する pg ドライバーを接続する「橋渡し役」になります。
const { PrismaPg } = require("@prisma/adapter-pg");

// Node.js で最も標準的な PostgreSQL クライアントライブラリである 'pg' から Pool クラスをインポートします。
const { Pool } = require("pg");



const express = require("express");
const app = express();

app.use(express.json())

const PORT = 8000;


// 接続文字列（DATABASE_URL）を使用して、DBへの「接続の待機部屋（コネクションプール）」を作成します。
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// 先ほど作成した pg のプール（実体）を、Prisma が扱える形式（Adapter）に包み込みます。
const adapter = new PrismaPg(pool);

// 従来の Rust エンジンではなく、今作った JavaScript 製のアダプター経由で通信するように設定して Client を生成します。
const prisma = new PrismaClient({ adapter });


app.listen(PORT, () => { 
    console.log("サーバーを起動中・・・")
})


//全取得
app.get("/",async (req,res) => {
    const posts = await prisma.posts.findMany();
    return res.json(posts)
})

//特定のidの投稿を取得
app.get("/:id",async (req,res) => {
    const id = req.params.id;
    const post = await prisma.posts.findUnique({
        where: {
            id: Number(id),
        },
    });
    return res.json(post)
})


//新規投稿
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

//内容を更新
app.put("/:id",async (req,res) => {

    const id = req.params.id;
    
    const {body} = req.body;

    //
    const updatedPost = await prisma.posts.update({
        where: {
            id: Number(id),
        },
        data: {
            body: body,
        },
    });
    return res.json(updatedPost);
})

