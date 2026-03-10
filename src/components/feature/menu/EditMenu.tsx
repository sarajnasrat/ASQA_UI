import React, { useEffect, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import MenuService from '../../../services/menu.service';
import { useAppToast } from '../../../hooks/useToast';

interface EditMenuProps {
  menuId: string;
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditMenu: React.FC<EditMenuProps> = ({ menuId, visible, onClose, onSuccess }) => {
  const { toast, showToast } = useAppToast();

  const [label, setLabel] = useState('');
  const [path, setPath] = useState('');
  const [icon, setIcon] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch menu data on open
  useEffect(() => {
    if (menuId && visible) {
      const fetchMenu = async () => {
        try {
          const response = await MenuService.getMenu(menuId);
          setLabel(response.data.label || '');
          setPath(response.data.path || '');
          setIcon(response.data.icon || '');
        } catch (error) {
          console.error(error);
          showToast('error', 'Error', 'Failed to load menu data');
        }
      };
      fetchMenu();
    }
  }, [menuId, visible]);

  const handleSubmit = async () => {
    if (!label || !path) {
      showToast('warn', 'Validation', 'Label and Path are required');
      return;
    }

    setLoading(true);
    try {
      await MenuService.updateMenu(menuId, { label, path, icon });
      showToast('success', 'Success', 'Menu updated successfully');
      onSuccess();
    } catch (error) {
      console.error(error);
      showToast('error', 'Error', 'Failed to update menu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      header="Edit Menu"
      visible={visible}
      style={{ width: '400px' }}
      modal
      onHide={onClose}
      footer={
        <div className="flex justify-end gap-2">
          <Button label="Cancel" icon="pi pi-times" text onClick={onClose} />
          <Button
            label="Save"
            icon="pi pi-check"
            severity="success"
            onClick={handleSubmit}
            loading={loading}
          />
        </div>
      }
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-col">
          <label htmlFor="label" className="font-medium">Label</label>
          <InputText
            id="label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Enter menu label"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="path" className="font-medium">Path</label>
          <InputText
            id="path"
            value={path}
            onChange={(e) => setPath(e.target.value)}
            placeholder="Enter menu path"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="icon" className="font-medium">Icon</label>
          <InputText
            id="icon"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            placeholder="Enter icon class (optional)"
          />
        </div>
      </div>
    </Dialog>
  );
};