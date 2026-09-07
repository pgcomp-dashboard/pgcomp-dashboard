<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmação de cadastro</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f5f7fb; margin: 0; padding: 32px 16px; color: #1f2937;">
    <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">
        <div style="padding: 24px 32px; background: #0f172a; color: #ffffff;">
            <h2 style="margin: 0; font-size: 24px;">Confirmação de cadastro</h2>
        </div>

        <div style="padding: 32px; line-height: 1.6;">
            <p style="margin-top: 0;">Olá, {{ $user->name }}.</p>
            <p>Recebemos sua solicitação de cadastro como estudante.</p>
            <p>Para concluir o seu acesso, clique no botão abaixo e defina sua senha.</p>

            <p style="margin: 28px 0; text-align: center;">
                <a href="{{ $verificationUrl }}" style="display: inline-block; background: #2563eb; color: #ffffff; text-decoration: none; padding: 14px 24px; border-radius: 8px; font-weight: bold;">
                    Definir minha senha
                </a>
            </p>

            <p style="font-size: 14px; color: #4b5563;">Se o botão não funcionar, copie e cole este link no navegador:</p>
            <p style="font-size: 14px; word-break: break-all; color: #1d4ed8;">{{ $verificationUrl }}</p>
        </div>
    </div>
</body>
</html>
