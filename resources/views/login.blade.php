<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title>Login</title>

        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.0-beta1/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-0evHe/X+R7YkIZDRvuzKMRqM+OrBnVFBL6DOitfPri4tjfHxaWutUpFmBp4vmVor" crossorigin="anonymus">

    </head>
    <body>
        <main class="container align-center p-5">
            <form method="POST" action="{{route('inicia-sesion')}}">
                @csrf
                <div class="mb-3">
                    <label for="emailInput" class="form-label">Emaile</label>
                    <input type="email" class="form-control" id="emailInput" name="email" required>
                </div>
                <div class="mb-3">
                    <label for="passwordInput" class="form-label">Password</label>
                    <input type="password" class="form-control" id="passwordInput" name="password" required>
                </div>
                <div class="mb-3 form-check">
                    <input type="checkbox" class="form-check-input" id="rememberCheck" name="remember">
                    <label for="rememberCheck" class="form-check-label">Mantener sesion iniciada</label>
                </div>
                <div>
                    <p>¿No tienes cuenta? <a href="{{route('registro')}}">Registrate</a></p>
                </div>
                <button type="submit" class="btn btn-primary">Acceder</buttton>
            </form>
        </main>
    </body>
    
</html>
