import { Difficulty, getDifficultyIcon } from "@/models/enums/difficulty.enum";
import { CommonModule } from "@angular/common";
import { Component, OnChanges, SimpleChanges, input } from "@angular/core";

@Component({
	selector: "app-difficulty-mark",
	imports: [CommonModule],
	templateUrl: "./difficulty-mark.component.html",
})
export class DifficultyMarkComponent implements OnChanges {
	readonly class = input<string>();
	readonly difficulty = input.required<Difficulty>();
	readonly size = input<number>(40);

	difficultyIcon: string | null = null;

	ngOnChanges(changes: SimpleChanges): void {
		const difficulty = this.difficulty();
  if (changes["difficulty"] && difficulty) {
			this.difficultyIcon = getDifficultyIcon(difficulty);
			/* console.log(
				`Difficulty icon: ${this.difficultyIcon} for difficulty: ${this.difficulty}`,
			); */
		}
	}
}
