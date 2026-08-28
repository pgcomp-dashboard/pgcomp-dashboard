<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: 'Segoe UI', Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 30px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">

                    {{-- Header com logo --}}
                    <tr>
                        <td align="center" style="padding: 28px 40px 24px; border-bottom: 1px solid #ebebeb;">
                            <img src="https://sgb.app.ic.ufba.br/assets/pgcomp_1.png"
                                 alt="PGCOMP UFBA"
                                 width="120"
                                 style="display: block; width: 120px; height: auto; border: 0;">
                        </td>
                    </tr>

                    {{-- Corpo --}}
                    <tr>
                        <td style="padding: 40px 40px 30px;">

                            @if ($status === 'pending')
                                <h2 style="margin: 0 0 16px; color: #1a3a5c; font-size: 22px;">
                                    Solicitação recebida
                                </h2>
                                <p style="margin: 0 0 12px; color: #444444; font-size: 15px; line-height: 1.6;">
                                    Olá, <strong style="color: #1a3a5c;">{{ $requester->name }}</strong>!
                                </p>
                                <p style="margin: 0 0 28px; color: #444444; font-size: 15px; line-height: 1.6;">
                                    Sua solicitação de acesso de administrador foi recebida e está aguardando análise.
                                    Você será notificado por e-mail assim que houver uma decisão.
                                </p>

                            @elseif ($status === 'approved')
                                <h2 style="margin: 0 0 16px; color: #15803d; font-size: 22px;">
                                    Solicitação aprovada!
                                </h2>
                                <p style="margin: 0 0 12px; color: #444444; font-size: 15px; line-height: 1.6;">
                                    Olá, <strong style="color: #15803d;">{{ $requester->name }}</strong>!
                                </p>
                                <p style="margin: 0 0 28px; color: #444444; font-size: 15px; line-height: 1.6;">
                                    Sua solicitação de acesso de administrador foi <strong>aprovada</strong>.
                                    Você já pode acessar o painel com suas novas permissões.
                                </p>

                            @elseif ($status === 'rejected')
                                <h2 style="margin: 0 0 16px; color: #b91c1c; font-size: 22px;">
                                    Solicitação rejeitada
                                </h2>
                                <p style="margin: 0 0 12px; color: #444444; font-size: 15px; line-height: 1.6;">
                                    Olá, <strong style="color: #b91c1c;">{{ $requester->name }}</strong>!
                                </p>
                                <p style="margin: 0 0 28px; color: #444444; font-size: 15px; line-height: 1.6;">
                                    Infelizmente sua solicitação de acesso de administrador foi <strong>rejeitada</strong>.
                                    Entre em contato com a coordenação do PGCOMP para mais informações.
                                </p>
                            @endif

                            {{-- Botão --}}
                            @if ($status === 'approved')
                            <table cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="border-radius: 6px; background-color: #2563eb;">
                                        <a href="https://pgcomp.app.ic.ufba.br/"
                                           target="_blank"
                                           style="display: inline-block; padding: 14px 32px; color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none; border-radius: 6px; letter-spacing: 0.3px;">
                                            Acessar o Painel
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            @endif

                        </td>
                    </tr>

                    {{-- Rodapé --}}
                    <tr>
                        <td style="padding: 20px 40px; border-top: 1px solid #e5e7eb; background-color: #f9fafb;">
                            <p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center;">
                                Programa de Pós-Graduação em Ciência da Computação &mdash; UFBA<br>
                                Este é um e-mail automático, não responda a esta mensagem.
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
