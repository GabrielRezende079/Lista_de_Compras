// Recupera os produtos cadastrados no localStorage
let produtos = JSON.parse(localStorage.getItem('listaProdutos')) || [];

// Filtra apenas os produtos ativos
let compras = produtos.filter(p => p.ativo);

// Atualiza a lista de compras no localStorage
localStorage.setItem('listaCompras', JSON.stringify(compras));

// Função para atualizar o localStorage sempre que a lista muda
function atualizarListaCompras() {
    localStorage.setItem('listaCompras', JSON.stringify(compras));
    verificarFinalizacaoCompra();
    renderizarLista();
}

// Função para renderizar os produtos na lista
function renderizarLista() {
    const lista = document.getElementById('listaCompras');
    lista.innerHTML = '';

    compras.forEach(produto => {
        const li = document.createElement('li');
        const coletado = produto.quantComprada >= produto.quantidade;
        li.innerHTML = `
            <span style="text-decoration: ${coletado ? 'line-through' : 'none'};">
                <strong>${produto.nome}</strong> (${produto.unidade}) - ${produto.quantidade} un
            </span>
            <br>
            Quantidade Comprada: 
            <input type="number" min="0" value="${produto.quantComprada || 0}" onchange="atualizarQuantidade(${produto.codProduto}, this.value)">
        `;
        lista.appendChild(li);
    });

    verificarFinalizacaoCompra();
}

// Função para atualizar a quantidade comprada
function atualizarQuantidade(codProduto, novaQuantidade) {
    const index = compras.findIndex(p => p.codProduto === codProduto);
    if (index !== -1) {
        compras[index].quantComprada = parseInt(novaQuantidade);
        atualizarListaCompras();
    }
}

// Verifica se todos os produtos foram coletados e ativa o botão de envio
function verificarFinalizacaoCompra() {
    const todosColetados = compras.every(p => (p.quantComprada || 0) >= p.quantidade);
    const btnEnviar = document.getElementById('btnEnviar');
    btnEnviar.disabled = !todosColetados;
}

// Envia os dados para a API do mockapi.io
function enviarParaServidor() {
    const urlCompras = 'https://684c3bdbed2578be881e2b26.mockapi.io/endpoint/Compras';
    const urlProdutos = 'https://684c3bdbed2578be881e2b26.mockapi.io/endpoint/Produtos';

    const compraData = {
        codCompras: Date.now().toString(),
        data: new Date().toISOString()
    };

    // Envia a compra
    fetch(urlCompras, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(compraData)
    })
    .then(res => res.json())
    .then(dadosCompra => {
        // Envia os produtos da compra
        const promises = compras.map(produto => {
            return fetch(urlProdutos, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    codProduto: produto.codProduto,
                    codCompra: dadosCompra.id, // usa ID gerado no mockapi
                    nome: produto.nome,
                    unidade: produto.unidade,
                    quantidade: produto.quantidade,
                    codigoBarra: produto.codigoBarra,
                    ativo: produto.ativo,
                    quantComprada: produto.quantComprada
                })
            });
        });

        return Promise.all(promises);
    })
    .then(() => {
        alert('Lista enviada com sucesso!');
        localStorage.removeItem('listaCompras');
        window.location.reload();
    })
    .catch(erro => {
        console.error('Erro ao enviar:', erro);
        alert('Erro ao enviar a lista. Tente novamente.');
    });
}

// Chamada inicial para montar a lista
renderizarLista();
