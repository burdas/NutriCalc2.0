import { useState, useEffect } from 'react';
import { Modal, Button, Input } from '@heroui/react';
import { Link2, Check, Share2 } from 'lucide-react';
import { buildShareUrl } from '../utils/sharePlan';

function copyToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  }
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  const ok = document.execCommand('copy');
  document.body.removeChild(textarea);
  return ok ? Promise.resolve() : Promise.reject(new Error('copy failed'));
}

export function SharePlanModal({ mealPlan, isOpen, onClose }) {
  const [url, setUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setUrl(buildShareUrl(mealPlan));
      setCopied(false);
    }
  }, [isOpen, mealPlan]);

  const canShare = typeof navigator !== 'undefined' && Boolean(navigator.share);

  async function handleCopy() {
    try {
      await copyToClipboard(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  async function handleShare() {
    if (!canShare) return;
    try {
      await navigator.share({
        title: 'Plan de comidas',
        text: 'Mi plan de comidas semanal',
        url,
      });
      onClose();
    } catch {}
  }

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <Modal.Container size="md">
        <Modal.Dialog>
          <Modal.CloseTrigger />
          <Modal.Header>
            <div className="flex flex-col gap-1 pr-8">
              <Modal.Heading>Compartir plan de comidas</Modal.Heading>
              <p className="text-xs text-muted">
                Cualquiera que abra este enlace podrá cargar tu plan
              </p>
            </div>
          </Modal.Header>
          <Modal.Body className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Input
                value={url}
                isReadOnly
                variant="secondary"
                aria-label="Enlace del plan de comidas"
                onFocus={(e) => e.target.select()}
                className="break-all"
              />
              <p className="text-xs text-muted">
                El plan va incluido en el enlace, así que funciona sin necesidad de servidor.
              </p>
            </div>
          </Modal.Body>
          <Modal.Footer className="flex flex-wrap justify-end gap-2">
            {canShare && (
              <Button variant="secondary" size="sm" onPress={handleShare}>
                <Share2 className="size-4" />
                Compartir…
              </Button>
            )}
            <Button variant="primary" size="sm" onPress={handleCopy}>
              {copied ? <Check className="size-4" /> : <Link2 className="size-4" />}
              {copied ? '¡Copiado!' : 'Copiar enlace'}
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
