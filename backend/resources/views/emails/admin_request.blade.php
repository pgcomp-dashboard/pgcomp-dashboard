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
                        <td align="center" style="background-color: #1a3a5c; padding: 28px 40px;">
                            <img src="{{ asset('images/logo.png') }}"
                                 alt="PGCOMP UFBA"
                                 width="100"
                                 style="display: block; width: 100px; height: auto;">
                        </td>
                    </tr>

                    {{-- Corpo --}}
                    <tr>
                        <td style="padding: 40px 40px 30px;">
                            <h2 style="margin: 0 0 16px; color: #1a3a5c; font-size: 22px;">
                                Nova solicitação de acesso admin
                            </h2>
                            <p style="margin: 0 0 12px; color: #444444; font-size: 15px; line-height: 1.6;">
                                O usuário <strong style="color: #1a3a5c;">{{ $requester->name }}</strong>
                                (<a href="mailto:{{ $requester->email }}" style="color: #2563eb; text-decoration: none;">{{ $requester->email }}</a>)
                                solicitou acesso de administrador ao sistema PGCOMP.
                            </p>
                            <p style="margin: 0 0 28px; color: #444444; font-size: 15px; line-height: 1.6;">
                                Acesse o painel para aprovar ou rejeitar a solicitação.
                            </p>

                            {{-- Botão --}}
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
