chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "scanForForm") {
    const fields = detectFormFields();

    if (fields.length == 0) {
      sendResponse({ found: false });
      return true;
    } 

    sendResponse({ found: true, fields });
    return true;
  }

  if (request.action === "getField") {
    
    let {inputType, originalId, originalName} = request.payload;
    let field = retrieveField(inputType, originalId, originalName);

    if(!field) {
      endResponse({ found: false });
      return true;
    }

    sendResponse({ found: true, field });
    return true;
  }
});

// Função para detetar campos de formulário na página de forma mais robusta
function detectFormFields() {
  const selectors = [
    'input[type="text"]:not([readonly]):not([disabled])',
    'input[type="password"]:not([readonly]):not([disabled])',
    'input[type="email"]:not([readonly]):not([disabled])',
    'input[type="tel"]:not([readonly]):not([disabled])',
    'input[type="url"]:not([readonly]):not([disabled])',
    'input[type="search"]:not([readonly]):not([disabled])',
    'input[type="number"]:not([readonly]):not([disabled])',
    'input[type="date"]:not([readonly]):not([disabled])',
    'input[type="month"]:not([readonly]):not([disabled])',
    'input[type="week"]:not([readonly]):not([disabled])',
    'input[type="time"]:not([readonly]):not([disabled])',
    'input[type="datetime-local"]:not([readonly]):not([disabled])',
    'textarea:not([readonly]):not([disabled])',
    'select:not([readonly]):not([disabled])'
    // Não incluir: hidden, submit, button, reset, radio, checkbox (preenchimento é diferente)
  ];
  const inputs = Array.from(document.querySelectorAll(selectors.join(', ')));
  
  const fields = inputs.map((input, index) => {
    let label = '';
    let potentialLabel = null;

    // 1. Tenta encontrar <label for="id">
    if (input.id) {
      potentialLabel = document.querySelector(`label[for="${input.id}"]`);
      if (potentialLabel) label = potentialLabel.textContent.trim();
    }

    // 2. Tenta encontrar <label> que envolve o <input>
    if (!label && input.parentElement && input.parentElement.tagName === 'LABEL') {
      label = input.parentElement.textContent.trim();
    }

    // 3. Tenta encontrar <label> como irmão anterior ou dentro de um div pai próximo
    if (!label) {
        let previousSibling = input.previousElementSibling;
        if (previousSibling && previousSibling.tagName === 'LABEL') {
            label = previousSibling.textContent.trim();
        } else if (input.parentElement && input.parentElement.previousElementSibling && input.parentElement.previousElementSibling.tagName === 'LABEL') {
            label = input.parentElement.previousElementSibling.textContent.trim();
        } else if (input.closest('div, p, span')) {
            const parentContainer = input.closest('div, p, span');
            const firstChildLabel = parentContainer.querySelector('label');
            if (firstChildLabel && !firstChildLabel.hasAttribute('for')) { // Label genérico no container
                 // Verifica se o label está próximo e não associado a outro input
                const labelsInContainer = Array.from(parentContainer.querySelectorAll('label'));
                const inputsInContainer = Array.from(parentContainer.querySelectorAll(selectors.join(', ')));
                const inputIndex = inputsInContainer.indexOf(input);
                if (labelsInContainer[inputIndex] && !labelsInContainer[inputIndex].hasAttribute('for')) {
                    label = labelsInContainer[inputIndex].textContent.trim();
                }
            }
        }
    }

    // 4. Usa atributos como placeholder, aria-label, title, name
    if (!label && input.placeholder) label = input.placeholder;
    if (!label && input.getAttribute('aria-label')) label = input.getAttribute('aria-label');
    if (!label && input.title) label = input.title;
    if (!label && input.name) label = input.name;
    
    // 5. Como último recurso, usa o tipo de input ou um identificador genérico
    if (!label) label = input.type ? `Campo ${input.type}` : `Campo ${index + 1}`;

    return { 
      // Usar um identificador único para o campo, pode ser o nome, id, ou um gerado.
      // O importante é que seja consistente entre a deteção e o preenchimento.
      uniqueId: input.name || input.id || `form-filler-field-${index}`,
      type: input.tagName.toLowerCase() === 'textarea' ? 'textarea' : input.type,
      label: label,
      originalId: input.id, // Guardar ID original para referência se necessário
      originalName: input.name // Guardar Name original para referência
    };
  });
  console.log("Campos detetados (versão robusta):", fields);
  // Envia apenas dados serializáveis e necessários para o mapeamento na sidebar
  return fields.map(f => ({uniqueId: f.uniqueId, originalId: f.originalId, type: f.type, label: f.label })); 
}

//****************************************************************** */
function retrieveField(type, id, name) {
  if (type !== "textarea") {
    type = `input[type='${type}']`;
  }

  let el = document.querySelector(`${type}#${id}`);
  
  if (!el) {
    el = Array.from(document.querySelectorAll(type)).find(e => e.getAttribute("name") === name);
  }

  el.value = "Campo preenchido automaticamente!";

  chrome.runtime.sendMessage({ action: "log", payload: el.value });

  return el || null;
}