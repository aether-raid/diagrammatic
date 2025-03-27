import Form from 'react-bootstrap/Form';

import { EntityItem } from "@shared/node.types";

interface GeneratedDescriptionsTabProps {
    items: EntityItem[];
}

export const GeneratedDescriptionsTab = ({ items }: GeneratedDescriptionsTabProps) => {
    return (
        <Form>
            <Form.Group className="d-flex align-items-center gap-2 fs-7">
                <Form.Label htmlFor="select-fn" className="mb-0 fw-bold text-nowrap">Generate for:</Form.Label>
                <Form.Select id="select-fn" size="sm">
                    {items.map((item, idx) => <option key={idx} value={item.name}>{item.name}</option>)}
                </Form.Select>
            </Form.Group>
        </Form>
    );
};
