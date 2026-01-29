<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;


class TaskController extends Controller
{
    public function index(Request $request){
        if ($request->has('completed')) {
            $tasks = Task::where('completed', true)->get();
        }
            else {
                $tasks = Task::all();
            }
        return view('tasks.index', compact('tasks'));
    }
    public function store(Request $request){
        $request->validate([
            'title' => 'required',
            'completed' => 'boolean'
        ]);
        Task::create([
            'title' => $request->title,
            'description' => $request->description,
            'completed' => false
        ]);
        return redirect('/tasks');
    }
    public function destroy($id){
        $task = Task::findOrFail($id);
        $task->delete();
        return redirect('/tasks');
    }
    public function update(Request $request, $id){
        $task = Task::findOrFail($id);
        $task->update([
            'completed' => !$task->completed
        ]);
        return redirect('/tasks');
    }
}