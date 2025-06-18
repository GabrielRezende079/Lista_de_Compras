const form = document.getElementById('formCadastro');
const lista = document.getElementById('listaProdutos');

let produtos = JSON.parse(localStorage.getItem('listaProdutos')) || [];

function atualizarLista() {
  lista.innerHTML = '';
  produtos.sort((a, b) => a.codProduto - b.codProduto);
  produtos.forEach((p, index) => {
    const li = document.createElement('li');
    li.textContent = `${p.codProduto} - ${p.nome} (${p.unidade}) - ${p.quantidade}`;
    
    const btnEditar = document.createElement('button');
    btnEditar.textContent = 'Editar';
    btnEditar.onclick = () => carregarProduto(index);

    const btnExcluir = document.createElement('button');
    btnExcluir.textContent = 'Excluir';
    btnExcluir.onclick = () => {
      produtos.splice(index, 1);
      salvar();
    };

    li.appendChild(btnEditar);
    li.appendChild(btnExcluir);
    lista.appendChild(li);
  });
}

function salvar() {
  localStorage.setItem('listaProdutos', JSON.stringify(produtos));
  atualizarLista();
}

function carregarProduto(index) {
  const p = produtos[index];
  document.getElementById('codProduto').value = p.codProduto;
  document.getElementById('nomeProduto').value = p.nome;
  document.getElementById('unidade').value = p.unidade;
  document.getElementById('quantidade').value = p.quantidade;
  document.getElementById('codBarra').value = p.codBarra;
  document.getElementById('ativo').checked = p.ativo;
  form.dataset.editando = index;
}

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const nome = document.getElementById('nomeProduto').value.trim();
  const unidade = document.getElementById('unidade').value;
  const quantidade = Number(document.getElementById('quantidade').value);
  const codBarra = document.getElementById('codBarra').value;
  const ativo = document.getElementById('ativo').checked;

  if (!nome || !unidade || isNaN(quantidade) || quantidade <= 0) {
    return alert('Preencha todos os campos obrigatórios corretamente.');
  }

  const novoProduto = {
    codProduto: form.dataset.editando !== undefined
      ? produtos[form.dataset.editando].codProduto
      : (produtos.length ? Math.max(...produtos.map(p => p.codProduto)) + 1 : 1),
    nome,
    unidade,
    quantidade,
    codigoBarra: codBarra,
    ativo,
    quantComprada: 0  // Corrigido aqui
  };

  if (form.dataset.editando !== undefined) {
    produtos[form.dataset.editando] = novoProduto;
    delete form.dataset.editando;
  } else {
    produtos.push(novoProduto);
  }

  form.reset();
  salvar();
});

atualizarLista();
