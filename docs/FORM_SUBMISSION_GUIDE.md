# Guia de Submissão de Formulários - FormService

Este guia explica como usar o novo sistema genérico de submissão de formulários implementado no `FormService`.

## Visão Geral

O método `handleFormSubmission` foi criado para generalizar a lógica de submissão de formulários, removendo código repetitivo e oferecendo uma interface consistente para todos os formulários da aplicação.

## Funcionalidades

### 1. Método Principal - `handleFormSubmission`

```typescript
async handleFormSubmission(
  form: FormGroup,
  fields: FormFieldConfig[],
  config: FormSubmissionConfig = {}
): Promise<FormSubmissionResult>
```

#### Parâmetros:

- `form`: O FormGroup do Angular a ser processado
- `fields`: Array de configurações dos campos do formulário
- `config`: Configurações opcionais para customizar o comportamento

#### Configurações Disponíveis:

```typescript
interface FormSubmissionConfig {
	// Função executada quando o formulário é válido
	onValidSubmit?: (formValue: any) => Promise<void> | void;

	// Função executada quando o formulário é inválido
	onInvalidSubmit?: (invalidControls: Record<string, any>) => void;

	// Habilita logs de debug
	enableDebugLogging?: boolean;
}
```

#### Resultado:

```typescript
interface FormSubmissionResult {
	isValid: boolean;
	formValue?: any;
	invalidControls?: Record<string, any>;
	error?: Error;
}
```

## Exemplos de Uso

### 1. Uso Básico (Componente Original)

```typescript
// Antes (código repetitivo)
onSubmit() {
  console.log("Trying to submit form");

  if (this.form.valid) {
    console.log("Form is valid, submitting...");
    let formValue = { ...this.form.value };

    // Lógica específica...

    this.dialogRef.close(formValue);
  } else {
    // Marcar campos como tocados...
  }
}

// Depois (usando o FormService)
async onSubmit() {
  const result = await this.formService.handleFormSubmission(
    this.form,
    this.formMode.fields,
    {
      onValidSubmit: async (formValue) => {
        // Lógica específica personalizada
        if (this.mode === "linking") {
          const bundleUrl = this.form.get("bundleUrl")?.value;
          if (bundleUrl) {
            await this.processBundleUrl(bundleUrl, this.form);
          }
        }
      },
      enableDebugLogging: true,
    }
  );

  if (result.isValid && result.formValue) {
    this.dialogRef.close(result.formValue);
  }
}
```

### 2. Uso Simplificado

```typescript
// Para formulários simples sem lógica personalizada
async onSubmit() {
  const result = await this.formService.submitForm(
    this.form,
    this.formMode.fields,
    true // enableDebugLogging
  );

  if (result.isValid) {
    // Processar resultado...
  }
}
```

### 3. Uso com Validação Personalizada

```typescript
async onSubmit() {
  const result = await this.formService.submitFormWithValidation(
    this.form,
    this.formMode.fields,
    async (formValue) => {
      // Validação personalizada
      await this.validateWithServer(formValue);
      await this.processSpecialLogic(formValue);
    },
    true // enableDebugLogging
  );

  if (result.isValid) {
    // Sucesso!
  }
}
```

### 4. Tratamento de Erros

```typescript
async onSubmit() {
  const result = await this.formService.handleFormSubmission(
    this.form,
    this.formMode.fields,
    {
      onValidSubmit: async (formValue) => {
        // Pode lançar exceção se algo der errado
        await this.processData(formValue);
      },
      onInvalidSubmit: (invalidControls) => {
        // Tratamento personalizado para formulário inválido
        this.showCustomErrorMessage(invalidControls);
      },
      enableDebugLogging: true,
    }
  );

  if (result.error) {
    console.error("Erro durante submissão:", result.error);
    // Tratar erro...
  }
}
```

## Benefícios

1. **Código Mais Limpo**: Remove lógica repetitiva de validação e processamento
2. **Consistência**: Todos os formulários seguem o mesmo padrão
3. **Flexibilidade**: Permite customização através de callbacks
4. **Tratamento de Erros**: Manejo centralizado de erros
5. **Debug**: Logs opcionais para facilitar desenvolvimento
6. **Testabilidade**: Lógica centralizada facilita testes unitários

## Métodos Auxiliares

### `markAllControlsAsTouched(form: FormGroup)`

Marca todos os controles do formulário como tocados, útil para exibir validações.

### `getInvalidControls(form: FormGroup)`

Retorna um objeto com todos os controles inválidos e seus erros.

### `submitForm(form, fields, enableDebugLogging)`

Versão simplificada sem lógica personalizada.

### `submitFormWithValidation(form, fields, validationCallback, enableDebugLogging)`

Versão com callback de validação personalizada.

## Migração

Para migrar formulários existentes:

1. Identifique a lógica de submissão no método `onSubmit`
2. Extraia a lógica personalizada para um callback `onValidSubmit`
3. Substitua a lógica de validação pelo método `handleFormSubmission`
4. Teste o funcionamento

Este sistema mantém a flexibilidade necessária enquanto padroniza o comportamento comum de todos os formulários.
