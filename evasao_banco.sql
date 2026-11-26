SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS Acao_Preventiva;
DROP TABLE IF EXISTS Frequencia;
DROP TABLE IF EXISTS Desempenho;
DROP TABLE IF EXISTS Parentesco;
DROP TABLE IF EXISTS Telefone_Responsavel;
DROP TABLE IF EXISTS Responsavel;
DROP TABLE IF EXISTS Aluno;
DROP TABLE IF EXISTS Turma;
DROP TABLE IF EXISTS Escola;
DROP TABLE IF EXISTS Pessoa;
DROP TABLE IF EXISTS Endereco;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE Endereco (
    CEP CHAR(8) PRIMARY KEY,
    Bairro VARCHAR(100),
    Logradouro VARCHAR(150)
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE Pessoa (
    CPF CHAR(11) PRIMARY KEY,
    Nome VARCHAR(150) NOT NULL,
    Data_Nascimento DATE,
    CEP CHAR(8),
    Genero VARCHAR(30),
    Raca_Etnia VARCHAR(50),
    Estado_Civil VARCHAR(30),
    Naturalidade VARCHAR(100),
    FOREIGN KEY (CEP) REFERENCES Endereco (CEP)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE Escola (
    ID_INEP VARCHAR(20) PRIMARY KEY,
    Nome_Escola VARCHAR(150) NOT NULL,
    Tipo_Escola VARCHAR(50),
    Tel_Escola VARCHAR(20),
    Possui_Acessibilidade_Fisica BOOLEAN,
    Possui_Atendimento_Especializado BOOLEAN
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE Turma (
    ID_Turma INT AUTO_INCREMENT PRIMARY KEY,
    Serie VARCHAR(20),
    Turno VARCHAR(20),
    Ano_Letivo INT,
    ID_INEP VARCHAR(20),
    FOREIGN KEY (ID_INEP) REFERENCES Escola (ID_INEP)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE Aluno (
    Matricula VARCHAR(30) PRIMARY KEY,
    CPF CHAR(11) UNIQUE,
    Data_Ingresso DATE,
    Necessita_Acessibilidade_Fisica BOOLEAN,
    Necessita_Acompanhamento_Especializado BOOLEAN,
    Situacao_Ocupacional VARCHAR(50),
    Status_Matricula VARCHAR(30),
    Tem_Filho BOOLEAN,
    ID_Turma INT,
    FOREIGN KEY (CPF) REFERENCES Pessoa (CPF),
    FOREIGN KEY (ID_Turma) REFERENCES Turma (ID_Turma)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE Responsavel (
    CPF CHAR(11) PRIMARY KEY,
    Renda_Mensal DECIMAL(10, 2),
    Escolaridade VARCHAR(50),
    FOREIGN KEY (CPF) REFERENCES Pessoa (CPF)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE Telefone_Responsavel (
    CPF_Responsavel CHAR(11),
    Telefone VARCHAR(20),
    PRIMARY KEY (CPF_Responsavel, Telefone),
    FOREIGN KEY (CPF_Responsavel) REFERENCES Responsavel (CPF) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE Parentesco (
    Matricula VARCHAR(30),
    CPF_Responsavel CHAR(11),
    Grau_Parentesco VARCHAR(50),
    Principal BOOLEAN,
    PRIMARY KEY (Matricula, CPF_Responsavel, Grau_Parentesco),
    FOREIGN KEY (Matricula) REFERENCES Aluno (Matricula),
    FOREIGN KEY (CPF_Responsavel) REFERENCES Responsavel (CPF)
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE Desempenho (
    ID_Turma INT,
    Matricula VARCHAR(30),
    Bimestre INT CHECK (Bimestre BETWEEN 1 AND 4),
    Media DECIMAL(4, 2) CHECK (Media BETWEEN 0.00 AND 10.00),
    PRIMARY KEY (ID_Turma, Matricula, Bimestre),
    FOREIGN KEY (ID_Turma) REFERENCES Turma (ID_Turma),
    FOREIGN KEY (Matricula) REFERENCES Aluno (Matricula)
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE Frequencia (
    ID_Turma INT,
    Matricula VARCHAR(30),
    Data DATE,
    Justificativa TEXT,
    Presenca BOOLEAN,
    PRIMARY KEY (ID_Turma, Matricula, Data),
    FOREIGN KEY (ID_Turma) REFERENCES Turma (ID_Turma),
    FOREIGN KEY (Matricula) REFERENCES Aluno (Matricula)
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE Acao_Preventiva (
    ID_Acao INT AUTO_INCREMENT PRIMARY KEY,
    Data_Abertura DATE,
    Tipo_Acao VARCHAR(50),
    Descricao_Plano TEXT,
    Status_Acao VARCHAR(30),
    Matricula VARCHAR(30),
    FOREIGN KEY (Matricula) REFERENCES Aluno (Matricula)
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


INSERT INTO Endereco (CEP, Bairro, Logradouro) VALUES
('12345678', 'Ancora', 'Rua das Tulipas, 100'),
('87654321', 'Jardim Marileia', 'Rua Niteroi, 500'),
('54353228', 'Enseada', 'Alameda das Oliveiras, 12'),
('66666666', 'Cidade Praiana', 'Av. Paulista, 50'),
('44444444', 'Costa Azul', 'Amaral Peixoto, 14');

INSERT INTO Pessoa (CPF, Nome, Data_Nascimento, CEP, Genero, Raca_Etnia, Estado_Civil, Naturalidade) VALUES
('11111111111', 'Rodrigo Cavalcanti', '2010-05-14', '12345678', 'Masculino', 'Pardo', 'Solteiro', 'São Paulo'),
('22222222222', 'Beatriz Costa', '2011-08-22', '87654321', 'Feminino', 'Branca', 'Solteiro', 'Rio de Janeiro'),
('33333333333', 'Roberto Silva', '2009-02-10', '54353228', 'Masculino', 'Pardo', 'Solteiro', 'São Paulo'),
('44444444444', 'Yasmim Cardoso', '2011-11-30', '66666666', 'Feminino', 'Branca', 'Solteiro', 'Belo Horizonte'),
('55555555555', 'Enzo Santos', '2010-01-05', '44444444', 'Masculino', 'Preta', 'Solteiro', 'Salvador'),
('66666666666', 'Matheus Pedro', '1987-01-05', '12345678', 'Masculino', 'Pardo', 'Casado', 'Amazonas'),
('77777777777', 'Joana Gonçalves', '1978-01-05', '87654321', 'Feminino', 'Preta', 'Solteiro', 'Sergipe'),
('88888888888', 'Roberta Maria', '1988-01-05', '44444444', 'Feminino', 'Preta', 'Solteiro', 'Tocantins'),
('99999999999', 'Taina Menezes', '1978-01-05', '54353228', 'Feminino', 'Preta', 'Solteiro', 'Sergipe'),
('10101010100', 'Romario Carlos', '1988-01-05', '66666666', 'Masculino', 'Preta', 'Solteiro', 'Tocantins');

INSERT INTO Escola (ID_INEP, Nome_Escola, Tipo_Escola, Tel_Escola, Possui_Acessibilidade_Fisica, Possui_Atendimento_Especializado) VALUES
('1001', 'Colégio Nilthon Baltazar', 'Pública', '21900000001', TRUE, TRUE),
('1002', 'Instituto de Educação Alfa', 'Privada', '22900000002', FALSE, TRUE),
('1003', 'Instituto de Educação Maxima', 'Privada', '22900000003', FALSE, TRUE),
('1004', 'Instituto Federal Fluminense', 'Pública', '21900000004', FALSE, TRUE),
('1005', 'Colégio Merces', 'Privada', '22900000005', FALSE, TRUE);


INSERT INTO Turma (ID_Turma, Serie, Turno, Ano_Letivo, ID_INEP) VALUES
(201, '9º Ano A', 'Manhã', 2026, '1001'),
(202, '1º Ano Médio B', 'Tarde', 2026, '1001'),
(101, '9º Ano A', 'Manhã', 2026, '1002'),
(102, '1º Ano Médio B', 'Tarde', 2026, '1002'),
(301, '3º Ano A', 'Manhã', 2026, '1003');

INSERT INTO Aluno (Matricula, CPF, Data_Ingresso, Necessita_Acessibilidade_Fisica, Necessita_Acompanhamento_Especializado, Situacao_Ocupacional, Status_Matricula, Tem_Filho, ID_Turma) VALUES
('2026001', '11111111111', '2024-02-01', FALSE, FALSE, 'Estudante', 'Ativo', FALSE, 201),
('2026002', '22222222222', '2024-02-01', FALSE, TRUE, 'Estudante', 'Ativo', FALSE, 201),
('2026003', '55555555555', '2025-01-20', TRUE, FALSE, 'Jovem Aprendiz', 'Ativo', FALSE, 202),
('2026004', '33333333333', '2024-02-01', FALSE, TRUE, 'Estudante', 'Ativo', FALSE, 101),
('2026005', '44444444444', '2025-01-20', TRUE, FALSE, 'Jovem Aprendiz', 'Ativo', FALSE, 202);


INSERT INTO Responsavel (CPF, Renda_Mensal, Escolaridade) VALUES
('66666666666', 6200.50, 'Superior Completo'),
('77777777777', 1500.00, 'Ensino Médio Completo'),
('88888888888', 3500.00, 'Ensino Médio Completo'),
('99999999999', 2200.50, 'Superior Completo'),
('10101010100', 3700.00, 'Ensino Médio Completo');

INSERT INTO Telefone_Responsavel (CPF_Responsavel, Telefone) VALUES
('66666666666', '21966665555'),
('77777777777', '11977776666'),
('88888888888', '21988887777'),
('99999999999', '21955554444'),
('10101010100', '11966665555');

INSERT INTO Parentesco (Matricula, CPF_Responsavel, Grau_Parentesco, Principal) VALUES
('2026001', '66666666666', 'Pai', TRUE),
('2026002', '77777777777', 'Mãe', TRUE),
('2026003', '88888888888', 'Mãe', TRUE),
('2026004', '99999999999', 'Mãe', TRUE),
('2026005', '10101010100', 'Pai', TRUE);


INSERT INTO Desempenho (ID_Turma, Matricula, Bimestre, Media) VALUES
(201, '2026001', 1, 8.50),
(201, '2026002', 2, 7.00),
(202, '2026003', 2, 4.50),
(101, '2026004', 2, 4.50),
(202, '2026005', 1, 9.20);

INSERT INTO Frequencia (ID_Turma, Matricula, Data, Justificativa, Presenca) VALUES
(201, '2026001', '2026-03-10', NULL, FALSE),
(201, '2026002', '2026-03-10', 'Acidente de carro', FALSE),
(202, '2026003', '2026-03-10', 'Consulta Médica', FALSE),
(101, '2026004', '2026-03-19', NULL, TRUE),
(202, '2026005', '2026-05-18', NULL, TRUE);


INSERT INTO Acao_Preventiva (ID_Acao, Data_Abertura, Tipo_Acao, Descricao_Plano, Status_Acao, Matricula) VALUES
(5001, '2026-08-12', 'Reforço Escolar', 'Aulas de reforço devido a notas baixas', 'Em Andamento', '2026003'),
(5002, '2025-09-17', 'Reforço Escolar', 'Acompanhamento de matemática no outro turno devido à nota baixa no 2º Bimestre.', 'Em Andamento', '2026004'),
(5003, '2026-05-22', 'Pedagoga especializada', 'Acompanhamento pedagógico falta de atenção em sala.', 'Em Andamento', '2026002'),
(5004, '2026-04-19', 'Acompanhamento psicológico', 'Encaminhamento para profissionais pois houve agressividade em sala de aula.', 'Em Andamento', '2026001'),
(5005, '2025-07-15', 'Autoridades e responsáveis', 'Acompanhamento do aluno e contato com o conselho tutelar por muitas ausencias.', 'Encerrado', '2026005');