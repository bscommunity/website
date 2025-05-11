import { Difficulty, getDifficultyIcon } from "@/models/enums/difficulty.enum";
import { CommonModule } from "@angular/common";
import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";

@Component({
	selector: "app-cover-art",
	imports: [CommonModule],
	templateUrl: "./cover-art.component.html",
})
export class CoverArtComponent implements OnChanges {
	@Input() class?: string = "";
	@Input() src!: string;
	@Input() difficulty!: Difficulty;

	@Input() alt?: string = "Cover art";
	@Input() size: number = 82;

	difficultyIcon: string | null = null;

	ngOnChanges(changes: SimpleChanges): void {
		if (changes["difficulty"] && this.difficulty) {
			this.difficultyIcon = getDifficultyIcon(this.difficulty);
			console.log(
				`Difficulty icon: ${this.difficultyIcon} for difficulty: ${this.difficulty}`,
			);
		}
	}
}
