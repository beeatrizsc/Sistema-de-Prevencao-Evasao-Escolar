<?php
header('Content-Type: application/json; charset=utf-8');
require_once 'conexao.php';

$acao = $_GET['acao'] ?? '';
$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;

try {
    // 1. READ: Listar Estudantes (com JOIN completo) e Ações Preventivas
    if ($acao === 'listar') {
        $sqlEstudantes = "
            SELECT 
                a.Matricula AS matricula,
                p.Nome AS nome,
                COALESCE(e.Bairro, 'Não informado') AS bairro,
                CONCAT(t.Serie, ' (', t.Turno, ')') AS turma,
                a.Situacao_Ocupacional AS ocupacao,
                a.Tem_Filho AS temFilho,
                a.Necessita_Acessibilidade_Fisica AS acessibilidade,
                a.Necessita_Acompanhamento_Especializado AS acompanhamento,
                COALESCE(pr.Nome, 'Não vinculado') AS respNome,
                COALESCE(pa.Grau_Parentesco, '') AS respParentesco,
                COALESCE(tr.Telefone, 'Sem telefone') AS telefone,
                COALESCE(r.Renda_Mensal, 0) AS rendaNum,
                (SELECT AVG(d.Media) FROM Desempenho d WHERE d.Matricula = a.Matricula) AS mediaGeral
            FROM Aluno a
            INNER JOIN Pessoa p ON a.CPF = p.CPF
            LEFT JOIN Endereco e ON p.CEP = e.CEP
            LEFT JOIN Turma t ON a.ID_Turma = t.ID_Turma
            LEFT JOIN Parentesco pa ON a.Matricula = pa.Matricula AND pa.Principal = TRUE
            LEFT JOIN Responsavel r ON pa.CPF_Responsavel = r.CPF
            LEFT JOIN Pessoa pr ON r.CPF = pr.CPF
            LEFT JOIN Telefone_Responsavel tr ON r.CPF = tr.CPF_Responsavel
            GROUP BY a.Matricula
            ORDER BY p.Nome ASC
        ";
        $stmtEst = $pdo->query($sqlEstudantes);
        $estudantesRaw = $stmtEst->fetchAll();

        $estudantes = [];
        foreach ($estudantesRaw as $row) {
            // Calcula o Score de Risco com base nos dados reais do banco
            $pontos = 10;
            if ($row['ocupacao'] === 'Trabalho Informal') $pontos += 35;
            elseif ($row['ocupacao'] === 'Jovem Aprendiz' || $row['ocupacao'] === 'Trabalho Formal') $pontos += 20;
            if ($row['temFilho']) $pontos += 40;
            if ($row['acessibilidade']) $pontos += 10;
            if ($row['acompanhamento']) $pontos += 15;
            if ($row['rendaNum'] > 0 && $row['rendaNum'] <= 1500) $pontos += 15;
            if ($row['mediaGeral'] !== null && $row['mediaGeral'] < 6.0) $pontos += 25;
            if ($pontos > 100) $pontos = 100;

            $risco = $pontos >= 70 ? 'Alto' : ($pontos >= 40 ? 'Médio' : 'Baixo');

            $estudantes[] = [
                'matricula'   => $row['matricula'],
                'nome'        => $row['nome'],
                'bairro'      => $row['bairro'],
                'turma'       => $row['turma'],
                'responsavel' => $row['respParentesco'] ? "{$row['respNome']} ({$row['respParentesco']})" : $row['respNome'],
                'telefone'    => $row['telefone'],
                'renda'       => 'R$ ' . number_format((float)$row['rendaNum'], 2, ',', '.'),
                'ocupacao'    => $row['ocupacao'],
                'temFilho'    => (bool)$row['temFilho'],
                'risco'       => $risco,
                'pontos'      => $pontos
            ];
        }

        $sqlAcoes = "
            SELECT 
                ap.ID_Acao AS id,
                ap.Data_Abertura AS data,
                ap.Matricula AS matricula,
                COALESCE(p.Nome, 'Estudante') AS aluno,
                ap.Tipo_Acao AS tipo,
                ap.Descricao_Plano AS descricao,
                ap.Status_Acao AS status
            FROM Acao_Preventiva ap
            LEFT JOIN Aluno a ON ap.Matricula = a.Matricula
            LEFT JOIN Pessoa p ON a.CPF = p.CPF
            ORDER BY ap.ID_Acao DESC
        ";
        $acoes = $pdo->query($sqlAcoes)->fetchAll();

        echo json_encode(['sucesso' => true, 'estudantes' => $estudantes, 'acoes' => $acoes]);
        exit;
    }

    // 2. CREATE: Cadastrar Estudante + Endereço + Responsável + Parentesco + Telefone
    if ($acao === 'cadastrar_aluno') {
        $pdo->beginTransaction();

        $cep = preg_replace('/\D/', '', $input['cep']);
        $stmtEnd = $pdo->prepare("INSERT IGNORE INTO Endereco (CEP, Bairro, Logradouro) VALUES (?, ?, ?)");
        $stmtEnd->execute([$cep, $input['bairro'], $input['logradouro']]);

        $cpfAluno = preg_replace('/\D/', '', $input['alunoCpf']);
        $stmtPesA = $pdo->prepare("INSERT INTO Pessoa (CPF, Nome, Data_Nascimento, CEP, Genero, Raca_Etnia) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE Nome = VALUES(Nome)");
        $stmtPesA->execute([$cpfAluno, $input['alunoNome'], $input['alunoNasc'], $cep, $input['alunoGenero'], $input['alunoRaca']]);

        $stmtAlu = $pdo->prepare("INSERT INTO Aluno (Matricula, CPF, Data_Ingresso, Necessita_Acessibilidade_Fisica, Necessita_Acompanhamento_Especializado, Situacao_Ocupacional, Status_Matricula, Tem_Filho, ID_Turma) VALUES (?, ?, CURDATE(), ?, ?, ?, 'Ativo', ?, ?)");
        $stmtAlu->execute([
            $input['matricula'],
            $cpfAluno,
            $input['acessibilidade'] ? 1 : 0,
            $input['acompanhamento'] ? 1 : 0,
            $input['ocupacao'],
            $input['temFilho'] ? 1 : 0,
            (int)$input['idTurma']
        ]);

        $cpfResp = preg_replace('/\D/', '', $input['respCpf']);
        $stmtPesR = $pdo->prepare("INSERT IGNORE INTO Pessoa (CPF, Nome, CEP) VALUES (?, ?, ?)");
        $stmtPesR->execute([$cpfResp, $input['respNome'], $cep]);

        $stmtResp = $pdo->prepare("INSERT INTO Responsavel (CPF, Renda_Mensal, Escolaridade) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE Renda_Mensal = VALUES(Renda_Mensal)");
        $stmtResp->execute([$cpfResp, (float)$input['respRenda'], $input['respEscolaridade']]);

        $stmtTel = $pdo->prepare("INSERT IGNORE INTO Telefone_Responsavel (CPF_Responsavel, Telefone) VALUES (?, ?)");
        $stmtTel->execute([$cpfResp, $input['respTel1']]);
        if (!empty($input['respTel2'])) {
            $stmtTel->execute([$cpfResp, $input['respTel2']]);
        }

        $stmtPar = $pdo->prepare("INSERT INTO Parentesco (Matricula, CPF_Responsavel, Grau_Parentesco, Principal) VALUES (?, ?, ?, TRUE)");
        $stmtPar->execute([$input['matricula'], $cpfResp, $input['respParentesco']]);

        $pdo->commit();
        echo json_encode(['sucesso' => true, 'mensagem' => 'Estudante e responsável salvos no MySQL!']);
        exit;
    }

    // 3. CREATE: Cadastrar Ação Preventiva
    if ($acao === 'cadastrar_acao') {
        $stmt = $pdo->prepare("INSERT INTO Acao_Preventiva (Data_Abertura, Tipo_Acao, Descricao_Plano, Status_Acao, Matricula) VALUES (CURDATE(), ?, ?, ?, ?)");
        $stmt->execute([$input['tipo'], $input['descricao'], $input['status'], $input['matricula']]);
        echo json_encode(['sucesso' => true]);
        exit;
    }

    // 4. UPDATE: Concluir Ação Preventiva
    if ($acao === 'concluir_acao') {
        $stmt = $pdo->prepare("UPDATE Acao_Preventiva SET Status_Acao = 'Concluída' WHERE ID_Acao = ?");
        $stmt->execute([(int)$input['id']]);
        echo json_encode(['sucesso' => true]);
        exit;
    }

    // 5. DELETE: Excluir Ação Preventiva
    if ($acao === 'excluir_acao') {
        $stmt = $pdo->prepare("DELETE FROM Acao_Preventiva WHERE ID_Acao = ?");
        $stmt->execute([(int)$input['id']]);
        echo json_encode(['sucesso' => true]);
        exit;
    }

    // 6. DELETE: Excluir Estudante (limpa dependências antes por conta das FKs sem CASCADE)
    if ($acao === 'excluir_aluno') {
        $pdo->beginTransaction();
        $mat = $input['matricula'];
        $pdo->prepare("DELETE FROM Acao_Preventiva WHERE Matricula = ?")->execute([$mat]);
        $pdo->prepare("DELETE FROM Frequencia WHERE Matricula = ?")->execute([$mat]);
        $pdo->prepare("DELETE FROM Desempenho WHERE Matricula = ?")->execute([$mat]);
        $pdo->prepare("DELETE FROM Parentesco WHERE Matricula = ?")->execute([$mat]);
        $pdo->prepare("DELETE FROM Aluno WHERE Matricula = ?")->execute([$mat]);
        $pdo->commit();
        echo json_encode(['sucesso' => true]);
        exit;
    }

} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    http_response_code(400);
    echo json_encode(['sucesso' => false, 'erro' => $e->getMessage()]);
}
?>