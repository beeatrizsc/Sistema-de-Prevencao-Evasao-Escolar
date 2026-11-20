# Alerta Precoce — Sistema de Prevenção à Evasão Escolar

*Read this in [English](#-early-warning--school-dropout-prevention-system).*

---

## Português (PT-BR)

### Sobre o Projeto
O **Alerta Precoce** é uma plataforma web voltada para o monitoramento e a prevenção da evasão escolar entre adolescentes de 14 a 18 anos (9º ano do Ensino Fundamental e Ensino Médio). Alinhado ao **Objetivo de Desenvolvimento Sustentável 4 (ODS 4 - Educação de Qualidade)** da ONU, o sistema cruza dados pedagógicos (frequência diária e desempenho bimestral) com indicadores socioeconômicos para calcular um **Score de Risco** e permitir que a equipe escolar realize intervenções antes que o abandono aconteça.

Este projeto foi desenvolvido como avaliação prática da disciplina de Desenvolvimento Web na **Universidade Federal Fluminense (UFF)**, estendendo a modelagem de banco de dados previamente elaborada para um sistema funcional completo.

### Funcionalidades Principais
* **Área Institucional:** Apresentação do propósito do sistema, panorama estatístico da evasão escolar no Brasil e canais de contato.
* **Autenticação por Perfil:** Acesso diferenciado para **Gestores Escolares**, **Assistentes Sociais** e **Professores**.
* **Gestão Escolar (CRUD Completo):**
  * **Create:** Cadastro de turmas, alunos, responsáveis, registros diários de frequência, notas bimestrais e planos de ação preventiva.
  * **Read:** Consulta de estudantes, histórico de faltas, boletins e ranking de Score de Risco.
  * **Update:** Atualização do status de matrícula, retificação de notas/frequências e acompanhamento do status das ações preventivas.
  * **Delete:** Remoção ou inativação de registros obsoletos ou lançados incorretamente.

### Tecnologias Utilizadas
* **Frontend:** HTML5, CSS3, Bootstrap 4.4 e JavaScript
* **Backend:** PHP
* **Banco de Dados:** MySQL

---
---

## English (EN)

### About the Project
**Early Warning (Alerta Precoce)** is a web platform designed to monitor and prevent school dropout among adolescents aged 14 to 18 (9th grade and High School). Aligned with the UN **Sustainable Development Goal 4 (SDG 4 - Quality Education)**, the system cross-references pedagogical data (daily attendance and bimonthly grades) with socioeconomic indicators to calculate a **Risk Score**, enabling school staff to intervene before students drop out.

This project was developed for the Web Development course at **Universidade Federal Fluminense (UFF)**, expanding a previously designed relational database model into a full-stack web application.

### Key Features
* **Public Landing Pages:** Overview of the project's purpose, statistical insights on school dropout in Brazil, and contact form.
* **Role-Based Access:** Distinct dashboards and permissions for **Principals/Coordinators** and **Teachers**.
* **School Management (Full CRUD):**
  * **Create:** Register classes, students, legal guardians, daily attendance, bimonthly grades, and preventive action plans.
  * **Read:** Search students, attendance history, grade reports, and Risk Score rankings.
  * **Update:** Edit enrollment status, adjust attendance/grade records, and track the progress of preventive interventions.
  * **Delete:** Remove or deactivate outdated or mistaken records.

### Tech Stack
* **Frontend:** HTML5, CSS3, Bootstrap 4.4, and JavaScript
* **Backend:** PHP
* **Database:** MySQL
