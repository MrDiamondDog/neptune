import { Task } from "@/db/types";
import { prettyDate } from "@/lib/time";

import Divider from "../primitives/Divider";
import Modal, { ModalHeader, ModalProps } from "../primitives/Modal";

export default function TaskModal({ task, ...props }: { task: Task } & ModalProps) {
	return <Modal {...props} title={task.title}>
		{task.dueDate ? <ModalHeader>Due on {prettyDate(task.dueDate)}</ModalHeader>
			: <Divider />}
	</Modal>;
}
