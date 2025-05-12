import { useState, useEffect } from 'react';
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from '@/services/api';

type Qualis = {
    id: number;
    code: string;
    score: number;
    createdAt?: string;
    updatedAt?: string;
};

type RequestBodyType = {
    code: string;
    score: number;
};

export default function QualisPage() {
    const [qualisData, setQualisData] = useState<Qualis[]>([]);
    const [editingItem, setEditingItem] = useState<Qualis | null>(null);
    const [formData, setFormData] = useState({
        code: "",
        score: 0,
    });

    async function fetchQualisData() {
        try {
            const data = await api.getAllQualis();
            setQualisData(data.map((item: any) => ({
                id: Number(item.id),
                code: item.code,
                score: item.score,
                createdAt: item.created_at,
                updatedAt: item.updated_at,
            })));
        } catch (error) {
            console.error('Erro ao buscar os dados do Qualis:', error);
        }
    }

    const handleEdit = (item: Qualis) => {
        setEditingItem(item);
        setFormData({
            code: item.code,
            score: item.score,
        });
    };

    const handleSubmit = async () => {
        try {
            const parsedScore = parseFloat(formData.score.toString());
            if (isNaN(parsedScore)) {
                console.error('Score inválido');
                return;
            }

            const payload: RequestBodyType = {
                code: formData.code,
                score: parsedScore,
            };

            if (editingItem) {
                await api.updateQualis(editingItem.id, JSON.stringify(payload));
            }

            await fetchQualisData();
            setEditingItem(null);
            setFormData({ code: "", score: 0 });
        } catch (error) {
            console.error('Erro ao salvar Qualis:', error);
        }
    };


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: name === 'score' ? parseFloat(value) : value,
        }));
    };

    const handleCancel = () => {
        setEditingItem(null);
        setFormData({ code: "", score: 0 });
    };

    useEffect(() => {
        fetchQualisData();
    }, []);

    return (
        <div className="mt-10 w-full max-w-4xl">
            <h3 className="text-lg font-semibold mb-2">Gerenciar Qualis</h3>

            <div className="mb-6 p-4 border rounded-md">
                <h4 className="text-md font-semibold mb-2">
                    {editingItem ? "Editar Qualis" : "Novo Qualis"}
                </h4>
                <div className="mb-4">
                    <label htmlFor="code" className="block">Código</label>
                    <Input
                        type="text"
                        id="code"
                        name="code"
                        value={formData.code}
                        onChange={handleChange}
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="score" className="block">Score</label>
                    <Input
                        type="number"
                        id="score"
                        name="score"
                        value={formData.score}
                        onChange={handleChange}
                    />
                </div>
                <Button variant="default" onClick={handleSubmit}>
                    {editingItem ? "Atualizar" : "Criar"}
                </Button>
                {editingItem && (
                    <Button variant="secondary" onClick={handleCancel} className="ml-2">Cancelar</Button>
                )}
            </div>

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
                                <Button variant="secondary" onClick={() => handleEdit(item)}>
                                    Editar
                                </Button>
                                <Button variant="destructive">
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
    );
}
