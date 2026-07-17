document.addEventListener("DOMContentLoaded", function () {
    console.log("inscricoes.js carregado");

    const SUPABASE_URL =
        "https://zdvssnescksyeqanrmbx.supabase.co";

    const SUPABASE_PUBLISHABLE_KEY =
        "sb_publishable_OxIe45MfibiB6MwmouIyFQ_4JnVnOcX";

    if (!window.supabase) {
        console.error("Biblioteca do Supabase não carregada.");
        return;
    }

    const supabaseClient = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY,
        {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
                detectSessionInUrl: false
            }
        }
    );

    const formulario = document.getElementById("formInscricao");
    const mensagem = document.getElementById("mensagemFormulario");
    const botao = document.getElementById("botaoEnviar");

    if (!formulario || !mensagem || !botao) {
        console.error("Estrutura principal do formulário não encontrada.");
        return;
    }

    formulario.addEventListener("submit", async function (eventoSubmit) {
        eventoSubmit.preventDefault();

        mensagem.textContent = "";
        mensagem.className = "mensagem-formulario campo-completo";

        const campos = {
            evento: document.getElementById("evento"),
            nomeCompleto: document.getElementById("nomeCompleto"),
            cpf: document.getElementById("cpf"),
            dataNascimento: document.getElementById("dataNascimento"),
            telefone: document.getElementById("telefone"),
            email: document.getElementById("email"),
            escola: document.getElementById("escola"),
            categoria: document.getElementById("categoria"),
            aceiteLgpd: document.getElementById("aceiteLgpd")
        };

        const camposAusentes = Object.entries(campos)
            .filter(function ([, elemento]) {
                return !elemento;
            })
            .map(function ([nome]) {
                return nome;
            });

        if (camposAusentes.length > 0) {
            console.error("Campos ausentes:", camposAusentes);

            mensagem.textContent =
                "Erro de configuração. Campos ausentes: " +
                camposAusentes.join(", ");

            mensagem.classList.add("mensagem-erro");
            return;
        }

        if (!campos.aceiteLgpd.checked) {
            mensagem.textContent =
                "É necessário aceitar a declaração de privacidade.";

            mensagem.classList.add("mensagem-erro");
            return;
        }

        const cpfLimpo =
            campos.cpf.value.replace(/\D/g, "");

        if (cpfLimpo.length !== 11) {
            mensagem.textContent =
                "Informe um CPF com 11 números.";

            mensagem.classList.add("mensagem-erro");
            campos.cpf.focus();
            return;
        }

        const dados = {
            evento: campos.evento.value.trim(),
            nome_completo: campos.nomeCompleto.value.trim(),
            cpf: cpfLimpo,
            data_nascimento: campos.dataNascimento.value,
            telefone: campos.telefone.value.trim(),
            email: campos.email.value.trim().toLowerCase(),
            escola: campos.escola.value,
            categoria: campos.categoria.value,
            aceite_lgpd: true
        };

        botao.disabled = true;
        botao.textContent = "Enviando...";

        try {
            console.log("Dados enviados:", dados);

            const { error } = await supabaseClient
                .from("inscricoes_corrida")
                .insert([dados]);

            if (error) {
                throw error;
            }

            mensagem.textContent =
                "Inscrição realizada com sucesso!";

            mensagem.classList.add("mensagem-sucesso");

            formulario.reset();

        } catch (erro) {
            console.error("Erro do Supabase:", erro);

            if (erro.code === "23505") {
                mensagem.textContent =
                    "Este CPF já possui uma inscrição.";
            } else if (erro.code === "42501") {
                mensagem.textContent =
                    "A inscrição foi bloqueada pelas regras de segurança do banco.";
            } else {
                mensagem.textContent =
                    "Erro: " +
                    (erro.message ||
                        "Não foi possível concluir a inscrição.");
            }

            mensagem.classList.add("mensagem-erro");

        } finally {
            botao.disabled = false;
            botao.textContent = "Finalizar inscrição";
        }
    });
});