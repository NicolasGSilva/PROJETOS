<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lista de Tarefas</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="bg-light">
<div class="container py-5">
    <div class="row justify-content-center g-4">
        <div class="col-md-4">
            <div class="card shadow-sm">
                <div class="card-body">
                    <h3 class="card-title mb-4">Lista de Tarefas</h3>
                    <form method="POST" action="{{ route('tasks.store') }}">
                        @csrf
                        <div class="mb-3">
                            <label class="form-label">Título</label>
                            <input type="text" name="title" class="form-control" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Descrição</label>
                            <textarea name="description" class="form-control" rows="3"></textarea>
                        </div>
                        <button type="submit" class="btn btn-primary">
                            Salvar
                        </button>
                    </form>
                    <div class="mt-4">
                        @forelse ($tasks as $task)
                            <div class="card mb-2">
                                <div class="card-body d-flex justify-content-between align-items-center">
                                    <div>
                                        <strong>{{ $task->title }}</strong><br>
                                        <small class="text-muted">
                                            {{ $task->description }}
                                        </small>
                                    </div>
                                    <div class="d-flex gap-2 align-items-center">
                                        @if ($task->completed)
                                            <span class="badge bg-success">Concluída</span>
                                        @else
                                            <span class="badge bg-secondary">Pendente</span>
                                        @endif
                                        <form method="POST" action="{{ route('tasks.update', $task->id) }}">
                                            @csrf
                                            @method('PUT')
                                            <input type="hidden" name="title" value="{{ $task->title }}">
                                            <input type="hidden" name="description" value="{{ $task->description }}">
                                            <input type="hidden" name="completed" value="{{ $task->completed ? 0 : 1 }}">
                                            <button class="btn btn-success btn-sm">
                                                {{ $task->completed ? 'Reabrir' : 'Concluir' }}
                                            </button>
                                        </form>
                                        <form method="POST" action="{{ route('tasks.destroy', $task->id) }}">
                                            @csrf
                                            @method('DELETE')
                                            <button class="btn btn-danger btn-sm">
                                                Excluir
                                            </button>
                                        </form>

                                    </div>
                                </div>
                            </div>
                        @empty
                            <p class="text-muted text-center mt-3">
                                Nenhuma tarefa cadastrada
                            </p>
                        @endforelse
                    </div>
                    <div class="text-center text-muted mt-4">
                        <small>© 2024 Desenvolvido por Nicolas</small>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
</body>
</html>