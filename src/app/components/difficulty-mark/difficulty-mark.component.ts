import { Difficulty, getDifficultyIcon } from "@/models/enums/difficulty.enum";
import { CommonModule } from "@angular/common";
import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";

@Component({
	selector: "app-difficulty-mark",
	imports: [CommonModule],
	templateUrl: "./difficulty-mark.component.html",
})
export class DifficultyMarkComponent implements OnChanges {
	@Input() class?: string;
	@Input() difficulty!: Difficulty;
	@Input() size: number = 40;

	difficultyIcon: string | null = null;

	ngOnChanges(changes: SimpleChanges): void {
		if (changes["difficulty"] && this.difficulty) {
			this.difficultyIcon = getDifficultyIcon(this.difficulty);
			/* console.log(
				`Difficulty icon: ${this.difficultyIcon} for difficulty: ${this.difficulty}`,
			); */
		}
	}
}
