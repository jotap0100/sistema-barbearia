import express from "express"
import pool from "./db.js"
import cors from "cors"
import bcrypt from "bcryptjs"

const app = express()
const PORT = 3000

app.use(express.json())
app.use(cors())
app.use(express.static('front')) // Serve os arquivos HTML, CSS, JS da pasta front

// Memória temporária para armazenar agendamentos caso o banco não esteja rodando
const agendamentos = []

// Rota para criar agendamento
app.post('/api/agendamentos', async (req, res) => {
    try {
        const { codigo, cliente, telefone, email, servico, barbeiro, data, hora, valor, observacoes } = req.body

        const novoAgendamento = {
            id: agendamentos.length + 1,
            codigo: codigo || `DN-${Date.now().toString().slice(-4)}`,
            cliente,
            telefone,
            email,
            servico,
            barbeiro,
            data,
            hora,
            valor,
            observacoes,
            criadoEm: new Date().toISOString()
        }

        // Tenta salvar no PostgreSQL se a tabela existir
        try {
            await pool.query(
                `INSERT INTO agendamentos (codigo, cliente, telefone, email, servico, barbeiro, data, hora, valor, observacoes) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
                [novoAgendamento.codigo, cliente, telefone, email, servico, barbeiro, data, hora, valor, observacoes]
            )
        } catch (dbError) {
            // Se a tabela ou conexão do banco ainda não estiverem prontas, continua sem travar
            // console.log("Aviso: banco local não conectado, salvando na memória da sessão.")
        }

        agendamentos.push(novoAgendamento)
        console.log(`[Novo Agendamento] ${novoAgendamento.codigo} - ${novoAgendamento.cliente} (${novoAgendamento.servico}) com ${novoAgendamento.barbeiro} em ${novoAgendamento.data} às ${novoAgendamento.hora}`)

        return res.status(201).json({
            sucesso: true,
            mensagem: "Agendamento realizado com sucesso!",
            agendamento: novoAgendamento
        })
    } catch (error) {
        console.error("Erro ao registrar agendamento:", error)
        return res.status(500).json({ sucesso: false, erro: "Erro interno no servidor" })
    }
})

// Rota para listar agendamentos
app.get('/api/agendamentos', async (req, res) => {
    try {
        res.json({ sucesso: true, agendamentos })
    } catch (error) {
        res.status(500).json({ sucesso: false, erro: error.message })
    }
})

app.listen(PORT, () => {
    console.log(`💈 Barbearia Dom Navalha online em http://localhost:${PORT}`)
})
