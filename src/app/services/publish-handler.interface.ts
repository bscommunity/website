import { Type } from "@angular/core";

export interface PublishHandler<TFormData = any, TSuccessData = any> {
	// Componentes de cada etapa do fluxo
	getStepComponents(): Type<any>[];

	// Dados iniciais do formulário
	getInitialFormData(): TFormData;

	// Submissão do conteúdo
	submit(formData: TFormData): Promise<TSuccessData>;

	// (Opcional) Validação customizada
	validate?(formData: TFormData): string | null;
}
