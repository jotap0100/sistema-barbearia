CREATE TABLE IF NOT EXISTS clientes (
    id SERIAL PRIMARY KEY NOT NULL,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    telefone VARCHAR(30) NOT NULL,
    senha VARCHAR(150),
    cpf VARCHAR(14) UNIQUE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS barbeiros (
    id SERIAL PRIMARY KEY NOT NULL,
    nome VARCHAR(100) NOT NULL,
    especialidade VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    telefone VARCHAR(30),
    experiencia_anos INT DEFAULT 5,
    foto_url TEXT,
    ativo BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS servicos (
    id SERIAL PRIMARY KEY NOT NULL,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    preco NUMERIC(10, 2) NOT NULL,
    duracao_minutos INT NOT NULL,
    ativo BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS agendamentos (
    id SERIAL PRIMARY KEY NOT NULL,
    codigo VARCHAR(20) UNIQUE,
    cliente VARCHAR(100) NOT NULL,
    telefone VARCHAR(30) NOT NULL,
    email VARCHAR(100),
    servico VARCHAR(100) NOT NULL,
    barbeiro VARCHAR(100) NOT NULL,
    data VARCHAR(20) NOT NULL,
    hora VARCHAR(10) NOT NULL,
    valor VARCHAR(20),
    observacoes TEXT,
    status VARCHAR(30) DEFAULT 'Confirmado',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO barbeiros (nome, especialidade, telefone) VALUES 
('Carlos "Navalha" Silva', 'Master Barber & Fade', '(11) 99111-2222'),
('Rafael Mendes', 'Barboterapia & Visagismo', '(11) 99222-3333'),
('Lucas Albuquerque', 'Hair Stylist & Freestyle', '(11) 99333-4444'),
('André Santos', 'Cortes Clássicos na Tesoura', '(11) 99444-5555')
ON CONFLICT DO NOTHING;

INSERT INTO servicos (nome, preco, duracao_minutos) VALUES 
('Corte Clássico / Fade', 45.00, 40),
('Barba Terapia Completa', 40.00, 35),
('Combo VIP (Corte + Barba + Sobrancelha)', 75.00, 65),
('Pigmentação de Barba ou Cabelo', 35.00, 30),
('Tratamento & Hidratação Capilar', 50.00, 35),
('Corte Infantil', 40.00, 30)
ON CONFLICT DO NOTHING;
