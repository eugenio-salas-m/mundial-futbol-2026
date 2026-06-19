"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-client";
import PageHeader from "@/components/page-header";

export default function ProfilePage() {

  const [loading,
    setLoading] =
    useState(true);

  const [saving,
    setSaving] =
    useState(false);

  const [saved,
    setSaved] =
    useState(false);

    const [generatingAvatar,
        setGeneratingAvatar] =
        useState(false);
        
  const [form,
    setForm] =
    useState({

      nickname: "",

      whatsappNumber: "",

      whatsappOptIn: false,

      avatarMode: "google",

      avatarPrompt: "",

      avatarUrl: ""

    });

  useEffect(() => {

    loadProfile();

  }, []);

  const loadProfile =
    async () => {

      const supabase =
        createClient();

      const { data } =
        await supabase.auth.getUser();

      if (!data.user) {

        location.href = "/";
        return;

      }

      const response =
        await fetch(
          "/api/profile",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json"
            },
            body: JSON.stringify({
              authUserId:
                data.user.id
            })
          }
        );

      if (
        response.ok
      ) {

        const profile =
          await response.json();

        setForm(profile);

      }

      setLoading(false);

    };

  const save =
    async () => {

      setSaving(true);

      const supabase =
        createClient();

      const { data } =
        await supabase.auth.getUser();

      if (!data.user) {
        return;
      }

      const response =
        await fetch(
          "/api/profile",
          {
            method: "PUT",
            headers: {
              "Content-Type":
                "application/json"
            },
            body: JSON.stringify({

              authUserId:
                data.user.id,

              nickname:
                form.nickname,

              whatsappNumber:
                form.whatsappNumber,

              whatsappOptIn:
                form.whatsappOptIn,

              avatarMode:
                form.avatarMode,

              avatarPrompt:
                form.avatarPrompt

            })
          }
        );

      if (
        response.ok
      ) {

        const result =
            await response.json();

        if (
            result.generateAvatar
        ) {

            setGeneratingAvatar(
                true
              );
            
              await fetch(
                "/api/profile/generate-avatar",
                {
                  method: "POST",
                  headers: {
                    "Content-Type":
                      "application/json"
                  },
                  body: JSON.stringify({
                    authUserId:
                      data.user.id
                  })
                }
              );
            
              await loadProfile();

              setGeneratingAvatar(
                false
              );
            
        }
        
        setSaved(true);

        setTimeout(
          () =>
            setSaved(false),
          2000
        );

      }

      setSaving(false);

    };

  if (loading) {

    return (
      <div className="p-4">
        Cargando...
      </div>
    );

  }

  return (

    <div
      className="
        max-w-xl
        mx-auto
        p-4
      "
    >

      <PageHeader
        title="Mi Perfil"
      />

      <div
        className="
          space-y-4
        "
      >

        <div>

          <label
            className="
              block
              mb-1
            "
          >
            Nickname
          </label>

          <input
            className="
              w-full
              border
              rounded
              p-2
            "
            value={
              form.nickname
            }
            onChange={e =>
              setForm({
                ...form,
                nickname:
                  e.target.value
              })
            }
          />

        </div>

        <div>

          <label
            className="
              block
              mb-1
            "
          >
            WhatsApp
          </label>

          <input
            className="
              w-full
              border
              rounded
              p-2
            "
            value={
              form.whatsappNumber
            }
            onChange={e =>
              setForm({
                ...form,
                whatsappNumber:
                  e.target.value
              })
            }
          />

        </div>

        <label
          className="
            flex
            items-center
            gap-2
          "
        >

          <input
            type="checkbox"
            checked={
              form.whatsappOptIn
            }
            onChange={e =>
              setForm({
                ...form,
                whatsappOptIn:
                  e.target.checked
              })
            }
          />

          Acepto ser contactado por WhatsApp

        </label>

        <div>

          <div
            className="
              font-medium
              mb-2
            "
          >
            Avatar
          </div>

          <label
            className="
              flex
              items-center
              gap-2
            "
          >

            <input
              type="radio"
              name="avatarMode"
              checked={
                form.avatarMode ===
                "google"
              }
              onChange={() =>
                setForm({
                  ...form,
                  avatarMode:
                    "google"
                })
              }
            />

            Mantener foto Google

          </label>

          <label
            className="
              flex
              items-center
              gap-2
              mt-2
            "
          >

            <input
              type="radio"
              name="avatarMode"
              checked={
                form.avatarMode ===
                "ai"
              }
              onChange={() =>
                setForm({
                  ...form,
                  avatarMode:
                    "ai"
                })
              }
            />

            Generar Avatar IA

          </label>

        </div>

        <div>

          <textarea
            rows={3}
            disabled={
              form.avatarMode !==
              "ai"
            }
            className="
              w-full
              border
              rounded
              p-2
            "
            placeholder="
Describe tu avatar...
            "
            value={
              form.avatarPrompt
            }
            onChange={e =>
              setForm({
                ...form,
                avatarPrompt:
                  e.target.value
              })
            }
          />

        </div>

        <div
            className="
                flex
                flex-col
                items-center
            "
            >

            <img
                src={form.avatarUrl}
                alt="Avatar"
                className="
                w-32
                h-32
                rounded-full
                border
                object-cover
                shadow
                "
            />

            </div>
        <div
            className="
                flex
                justify-center
                pt-4
            "
            >

        <button
          onClick={save}
          disabled={
            saving ||
            generatingAvatar
          }
          className="
            px-4
            py-2
            rounded
            bg-blue-600
            text-white
          "
        >
          {
                generatingAvatar
                ? "Generando avatar..."
                : saving
                ? "Guardando..."
                : "Guardar"
            }
        </button>

        {saved && (

          <div
            className="
              text-green-600
              font-medium
            "
          >
            ✓ Guardado
          </div>

        )}

        </div>
      </div>

    

    {
        generatingAvatar && (
    
        <div
            className="
            fixed
            inset-0
            bg-black/50
            flex
            items-center
            justify-center
            z-50
            "
        >
    
            <div
            className="
                bg-white
                rounded-lg
                p-6
                text-center
                shadow-lg
            "
            >
    
            <div
                className="
                animate-spin
                rounded-full
                h-12
                w-12
                border-4
                border-gray-300
                border-t-blue-600
                mx-auto
                mb-4
                "
            />
    
            <div
                className="
                font-medium
                "
            >
                Generando avatar IA...
            </div>
    
            <div
                className="
                text-sm
                text-gray-500
                mt-2
                "
            >
                Esto puede tardar
                algunos segundos
            </div>
    
            </div>
    
        </div>
    
        )
    }

    </div>
  );

}