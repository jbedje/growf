import React, { type ReactNode } from 'react';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md'
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className={`relative bg-white rounded-lg shadow-xl w-full ${sizeClasses[size]} transform transition-all`}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <span className="sr-only">Fermer</span>
              <span className="text-xl">✕</span>
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  type = 'danger'
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const typeConfig = {
    danger: {
      icon: '⚠️',
      bgColor: 'bg-red-50',
      iconBg: 'bg-red-100',
      buttonVariant: 'danger' as const
    },
    warning: {
      icon: '⚠️',
      bgColor: 'bg-yellow-50',
      iconBg: 'bg-yellow-100',
      buttonVariant: 'outline' as const
    },
    info: {
      icon: 'ℹ️',
      bgColor: 'bg-blue-50',
      iconBg: 'bg-blue-100',
      buttonVariant: 'outline' as const
    }
  };

  const config = typeConfig[type];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className={`${config.bgColor} rounded-lg p-4 mb-4`}>
        <div className="flex">
          <div className={`flex-shrink-0 ${config.iconBg} rounded-full p-2 mr-3`}>
            <span className="text-lg">{config.icon}</span>
          </div>
          <div>
            <p className="text-sm text-gray-700">{message}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <Button variant="outline" onClick={onClose}>
          {cancelText}
        </Button>
        <Button variant={config.buttonVariant} onClick={handleConfirm}>
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
};