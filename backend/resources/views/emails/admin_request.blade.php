<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nova solicitação de acesso admin</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f7f7f7; font-family: system-ui, -apple-system, 'Segoe UI', Arial, sans-serif; -webkit-font-smoothing: antialiased;">

    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #f7f7f7; padding: 40px 16px;">
        <tr>
            <td align="center">

                {{-- Card principal --}}
                <table width="560" cellpadding="0" cellspacing="0" role="presentation"
                       style="max-width: 560px; width: 100%; background-color: #ffffff; border: 1px solid #ebebeb; border-radius: 10px; overflow: hidden;">

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
                        <td style="padding: 32px 40px 28px;">

                            @if ($status === 'new_registration')
                                <h2 style="margin: 0 0 20px; font-size: 18px; font-weight: 600; color: #212121; line-height: 1.3; letter-spacing: -0.01em;">
                                    Novo cadastro pendente de aprovação
                                </h2>
                                <p style="margin: 0 0 12px; font-size: 14px; color: #4b4b4b; line-height: 1.6;">
                                    O usuário <strong style="color: #212121; font-weight: 600;">{{ $requester->name }}</strong>
                                    realizou um cadastro no sistema PGCOMP e aguarda aprovação.
                                </p>
                            @elseif ($status === 'pending')
                                <h2 style="margin: 0 0 20px; font-size: 18px; font-weight: 600; color: #212121; line-height: 1.3; letter-spacing: -0.01em;">
                                    Nova solicitação de acesso admin
                                </h2>
                                <p style="margin: 0 0 12px; font-size: 14px; color: #4b4b4b; line-height: 1.6;">
                                    O usuário <strong style="color: #212121; font-weight: 600;">{{ $requester->name }}</strong>
                                    solicitou acesso de administrador ao sistema PGCOMP.
                                </p>
                            @endif

                            <p style="margin: 0 0 8px; font-size: 14px; color: #737373; line-height: 1.6;">
                                E-mail:
                                <a href="mailto:{{ $requester->email }}"
                                   style="color: #212121; text-decoration: underline; font-weight: 500;">
                                    {{ $requester->email }}
                                </a>
                            </p>

                            {{-- Divisor --}}
                            <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
                                   style="margin: 24px 0;">
                                <tr>
                                    <td style="border-top: 1px solid #ebebeb; height: 1px; font-size: 0; line-height: 0;">&nbsp;</td>
                                </tr>
                            </table>

                            <p style="margin: 0 0 24px; font-size: 14px; color: #4b4b4b; line-height: 1.6;">
                                Acesse o painel para aprovar ou rejeitar a solicitação.
                            </p>

                            {{-- Botão --}}
                            @if ($status === 'pending' || $status === 'new_registration')
                            <table cellpadding="0" cellspacing="0" role="presentation">
                                <tr>
                                    <td style="border-radius: 8px; background-color: #212121;">
                                        <a href="https://pgcomp.app.ic.ufba.br/"
                                           target="_blank"
                                           style="display: inline-block; padding: 11px 24px; font-size: 14px; font-weight: 500; color: #fafafa; text-decoration: none; border-radius: 8px; letter-spacing: 0.01em; line-height: 1.5;">
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
                        <td style="padding: 20px 40px; border-top: 1px solid #ebebeb; background-color: #f7f7f7; border-radius: 0 0 10px 10px;">
                            <p style="margin: 0; font-size: 12px; color: #a3a3a3; line-height: 1.5; text-align: center;">
                                Programa de Pós-Graduação em Ciência da Computação — UFBA<br>
                                Este é um e-mail automático. Não responda a esta mensagem.
                            </p>
                        </td>
                    </tr>

                </table>

            </td>
        </tr>
    </table>

</body>
</html>
