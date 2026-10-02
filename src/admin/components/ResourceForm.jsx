import React from 'react';
import { AdminModal, Field, Input, Textarea, Select } from './AdminUI';
import { RESOURCE_CATEGORIES } from '../../shared/data/constants';
import { countyNames } from '../../shared/data/kenyaCounties';

const emptyForm = () => ({
    name: '', region: '', type: 'Forest', category: '', detail: '',
    description: '', economicValue: '', conservationStatus: '', tourismPotential: ''
});

/**
 * Resource create/edit form.
 *
 * The region list is the 47 official counties and the category list comes from
 * the shared taxonomy. The previous version used the eight former provinces and
 * a handful of ad-hoc lowercase categories, neither of which matched what is
 * actually stored, so most records could not be selected or filtered at all.
 */
const ResourceForm = ({ open, resource, onClose, onSave, saving, error }) => {
    const [form, setForm] = React.useState(emptyForm());

    React.useEffect(() => {
        if (!open) return;
        setForm(
            resource
                ? {
                    name: resource.name || '',
                    region: resource.region || '',
                    type: resource.type || 'Forest',
                    category: resource.category || '',
                    detail: resource.detail || '',
                    description: resource.description || '',
                    economicValue: resource.economicValue || '',
                    conservationStatus: resource.conservationStatus || '',
                    tourismPotential: resource.tourismPotential || ''
                }
                : emptyForm()
        );
    }, [open, resource]);

    const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
    const categories = RESOURCE_CATEGORIES.natural;

    return (
        <AdminModal
            open={open}
            title={resource ? 'Edit Resource' : 'Add Resource'}
            onClose={onClose}
            onSubmit={onSave}
            saving={saving}
            submitLabel={resource ? 'Update Resource' : 'Add Resource'}
            error={error}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Name" required className="md:col-span-2">
                    <Input {...set('name')} value={form.name} placeholder="e.g. Aberdare Forest" />
                </Field>

                <Field label="County / Region">
                    <Select {...set('region')} value={form.region}>
                        <option value="">Select county</option>
                        {countyNames.map((c) => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </Select>
                </Field>

                <Field label="Category">
                    <Select {...set('category')} value={form.category}>
                        <option value="">Select category</option>
                        {categories.map((c) => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </Select>
                </Field>

                <Field label="Type" hint="Free-form subtype, e.g. Forest, Lake, Geothermal Plant.">
                    <Input {...set('type')} value={form.type} placeholder="Forest" />
                </Field>

                <Field label="Short detail">
                    <Input {...set('detail')} value={form.detail} placeholder="e.g. Forest, Nyeri" />
                </Field>

                <Field label="Economic value">
                    <Input {...set('economicValue')} value={form.economicValue} placeholder="e.g. High" />
                </Field>

                <Field label="Conservation status">
                    <Input {...set('conservationStatus')} value={form.conservationStatus} placeholder="e.g. Protected area" />
                </Field>

                <Field label="Tourism potential" className="md:col-span-2">
                    <Input {...set('tourismPotential')} value={form.tourismPotential} placeholder="e.g. High" />
                </Field>

                <Field label="Description" className="md:col-span-2">
                    <Textarea {...set('description')} value={form.description} rows={4} placeholder="Describe this resource..." />
                </Field>
            </div>
        </AdminModal>
    );
};

export default ResourceForm;