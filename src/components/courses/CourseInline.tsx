import { Course } from "@/db/types";
import { useApp } from "../context/NeptuneContext";
import MeetingsInline from "../meetings/MeetingsInline";
import Subtext from "../primitives/Subtext";

export default function CourseInline({ course }: { course: Course }) {
	const { meetings } = useApp();
	const courseMeetings = meetings.filter(m => m.courseId === course.id);

	return <div>
		<p className="font-bold">{course.name}</p>
		<Subtext className="text-xs">{course.subject} {course.number}</Subtext>
	</div>
}
