import { useState } from 'react';
import {
    BookOpen,
    Folders,
    GraduationCap,
    LogOut,
    Users,
} from 'lucide-react';

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
} from '@/components/ui/sidebar';
import { Link } from 'react-router';
import AppLogo from '@/components/AppLogo';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";


export default function QualisPage() {
    const pathname = '/admin/qualis';

    const [qualisData, setQualisData] = useState([
        {
            id: "Q001",
            code: "ABC123",
            score: 100,
            createdAt: "01/01/2024",
            updatedAt: "10/01/2024",
        },
        {
            id: "Q002",
            code: "XYZ789",
            score: 80,
            createdAt: "02/01/2024",
            updatedAt: "12/01/2024",
        },
    ]);

    const [form, setForm] = useState({
        id: '',
        code: '',
        score: '',
        createdAt: '',
        updatedAt: '',
    });

    const [isEditing, setIsEditing] = useState(false);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (isEditing) {
            setQualisData(prev =>
                prev.map(item => item.id === form.id ? { ...form, score: Number(form.score) } : item)
            );
        } else {
            const exists = qualisData.find(q => q.id === form.id);
            if (exists) {
                alert('ID já cadastrado.');
                return;
            }
            setQualisData(prev => [...prev, { ...form, score: Number(form.score) }]);
        }

        setForm({ id: '', code: '', score: '', createdAt: '', updatedAt: '' });
        setIsEditing(false);
    }

    function handleDelete(id: string) {
        setQualisData(prev => prev.filter(item => item.id !== id));
        if (form.id === id) {
            setForm({ id: '', code: '', score: '', createdAt: '', updatedAt: '' });
            setIsEditing(false);
        }
    }

    function handleRowClick(item: typeof qualisData[0]) {
        setForm({ ...item, score: String(item.score) });
        setIsEditing(true);
    }

    function handleCancelEdit() {
        setForm({ id: '', code: '', score: '', createdAt: '', updatedAt: '' });
        setIsEditing(false);
    }

    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full">
                <Sidebar>
                    <SidebarHeader className="border-b h-18">
                        <div className="flex items-center justify-center gap-2 px-2">
                            <AppLogo className='w-32' />
                        </div>
                    </SidebarHeader>
                    <SidebarContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={pathname === '/admin/qualis'}>
                                    <Link to="/admin/areas">
                                        <Users className="h-4 w-4" />
                                        <span>Áreas</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={pathname === '/admin/qualis'}>
                                    <Link to="/admin/qualis">
                                        <BookOpen className="h-4 w-4" />
                                        <span>Qualis</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarContent>
                    <SidebarFooter className="border-t">
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Link to="/">
                                        <LogOut className="h-4 w-4" />
                                        <span>Voltar para dashboard</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarFooter>
                </Sidebar>

                <div className="flex flex-col items-start w-full p-8">
                    <h2 className="text-xl font-bold mb-4 text-center w-full">
                        {isEditing ? "Editar Qualis" : "Cadastrar Qualis"}
                    </h2>
                    <form className="flex flex-wrap gap-4 w-full max-w-4xl" onSubmit={handleSubmit}>
                        <div className="flex flex-col min-w-[200px]">
                            <Label htmlFor="id">Id</Label>
                            <Input
                                id="id"
                                value={form.id}
                                onChange={(e) => setForm({ ...form, id: e.target.value })}
                                placeholder="Digite o ID"
                                required
                                disabled={isEditing}
                            />
                        </div>
                        <div className="flex flex-col min-w-[200px]">
                            <Label htmlFor="code">Código</Label>
                            <Input
                                id="code"
                                value={form.code}
                                onChange={(e) => setForm({ ...form, code: e.target.value })}
                                required
                            />
                        </div>
                        <div className="flex flex-col min-w-[200px]">
                            <Label htmlFor="score">Score</Label>
                            <Input
                                id="score"
                                type="number"
                                value={form.score}
                                onChange={(e) => setForm({ ...form, score: e.target.value })}
                                required
                            />
                        </div>
                        <div className="flex flex-col min-w-[200px]">
                            <Label htmlFor="createdAt">Criado em</Label>
                            <Input
                                id="createdAt"
                                value={form.createdAt}
                                onChange={(e) => setForm({ ...form, createdAt: e.target.value })}
                            />
                        </div>
                        <div className="flex flex-col min-w-[200px]">
                            <Label htmlFor="updatedAt">Atualizado em</Label>
                            <Input
                                id="updatedAt"
                                value={form.updatedAt}
                                onChange={(e) => setForm({ ...form, updatedAt: e.target.value })}
                            />
                        </div>
                        <div className="w-full flex justify-end mt-4 gap-4">
                            <Button type="submit">
                                {isEditing ? "Atualizar" : "Adicionar"}
                            </Button>
                            {isEditing && (
                                <Button type="button" variant="outline" onClick={handleCancelEdit}>
                                    Cancelar Edição
                                </Button>
                            )}
                        </div>
                    </form>

                    <div className="mt-10 w-full max-w-4xl">
                        <h3 className="text-lg font-semibold mb-2">Lista de Qualis Cadastrados</h3>
                        <Table>
                            <TableCaption>Registros de Qualis.</TableCaption>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Código</TableHead>
                                    <TableHead>Score</TableHead>
                                    <TableHead>Criado em</TableHead>
                                    <TableHead>Atualizado em</TableHead>
                                    <TableHead>Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {qualisData.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{item.id}</TableCell>
                                        <TableCell>{item.code}</TableCell>
                                        <TableCell>{item.score}</TableCell>
                                        <TableCell>{item.createdAt}</TableCell>
                                        <TableCell>{item.updatedAt}</TableCell>
                                        <TableCell className="flex gap-2">
                                            <Button
                                                variant="secondary"
                                                onClick={() => handleRowClick(item)}
                                            >
                                                Editar
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(item.id);
                                                }}
                                            >
                                                Remover
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>

                            <TableFooter>
                                <TableRow>
                                    <TableCell colSpan={2}>Total</TableCell>
                                    <TableCell>{qualisData.length}</TableCell>
                                    <TableCell colSpan={3} />
                                </TableRow>
                            </TableFooter>
                        </Table>
                    </div>
                </div>
            </div>
        </SidebarProvider>
    );
}
