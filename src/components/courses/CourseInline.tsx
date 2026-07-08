import { CourseInsert } from "@/db/types";

import Subtext from "../primitives/Subtext";

export default function CourseInline({ course }: { course: CourseInsert }) {
	return <div>
		<p className="font-bold">{course.name}</p>
		<Subtext className="text-xs">{course.subject} {course.number}</Subtext>
	</div>;
}
