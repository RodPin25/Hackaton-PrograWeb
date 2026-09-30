-- =====================================================================
-- MEDITRACK - Migracion del tracker de envios
-- Ejecutar UNA vez sobre la BD (es seguro repetirla: usa IF NOT EXISTS).
-- =====================================================================

-- 1) Columnas nuevas ---------------------------------------------------
ALTER TABLE pedidos_tracking
    ADD COLUMN IF NOT EXISTS temperatura DECIMAL(5,2);

ALTER TABLE pedidos
    ADD COLUMN IF NOT EXISTS fecha_entrega_estimada TIMESTAMP;

-- 2) Pedido de prueba con historial (CREADO -> ASIGNADO -> EN_CAMINO) ---
-- Usa el primer destino / proveedor / producto / usuarios que existan.
-- Las fechas son relativas a NOW(), asi el tracker sale con "Senal activa".
-- Si ya existe el pedido PED-2026-DEMO01 no se vuelve a insertar.
DO $$
DECLARE
    v_destino    INT;
    v_proveedor  INT;
    v_producto   INT;
    v_precio     NUMERIC;
    v_usuario    INT;
    v_repartidor INT;
    v_lat        NUMERIC;
    v_lng        NUMERIC;
    v_pedido     INT;
BEGIN
    IF EXISTS (SELECT 1 FROM pedidos WHERE codigo = 'PED-2026-DEMO01') THEN
        RAISE NOTICE 'El pedido de prueba PED-2026-DEMO01 ya existe. Nada que hacer.';
        RETURN;
    END IF;

    SELECT id, latitud, longitud INTO v_destino, v_lat, v_lng FROM destinos ORDER BY id LIMIT 1;
    SELECT id INTO v_proveedor FROM proveedores ORDER BY id LIMIT 1;
    SELECT id, precio INTO v_producto, v_precio FROM productos ORDER BY id LIMIT 1;
    SELECT id INTO v_usuario FROM usuarios ORDER BY id LIMIT 1;
    SELECT id INTO v_repartidor FROM usuarios ORDER BY id OFFSET 1 LIMIT 1;
    v_repartidor := COALESCE(v_repartidor, v_usuario);

    IF v_destino IS NULL OR v_producto IS NULL OR v_usuario IS NULL THEN
        RAISE EXCEPTION 'Faltan datos base (destinos / productos / usuarios) para crear el pedido de prueba.';
    END IF;

    INSERT INTO pedidos (codigo, destino_id, usuario_id, repartidor_id, proveedor_id,
                         estado_actual, total, notas_finales, fecha_entrega_estimada)
    VALUES ('PED-2026-DEMO01', v_destino, v_usuario, v_repartidor, v_proveedor,
            'EN_CAMINO', 120 * v_precio, 'Pedido de prueba para el tracker',
            NOW() + INTERVAL '1 day')
    RETURNING id INTO v_pedido;

    INSERT INTO pedidos_item (pedido_id, producto_id, cantidad, precio_unitario, subtotal)
    VALUES (v_pedido, v_producto, 120, v_precio, 120 * v_precio);

    INSERT INTO pedidos_tracking (pedido_id, usuario_id, estado, notas, latitud, longitud, temperatura, fecha_actualizacion)
    VALUES
      (v_pedido, v_usuario,    'CREADO',    'Pedido registrado en sistema',
         COALESCE(v_lat, 14.634915), COALESCE(v_lng, -90.506882), NULL, NOW() - INTERVAL '2 days'),
      (v_pedido, v_repartidor, 'ASIGNADO',  'Pedido preparado y asignado a repartidor',
         COALESCE(v_lat, 14.634915), COALESCE(v_lng, -90.506882), 4.0,  NOW() - INTERVAL '1 day'),
      (v_pedido, v_repartidor, 'EN_CAMINO', 'En ruta hacia el hospital destino',
         14.8300, -91.5180, 4.2, NOW() - INTERVAL '5 minutes');

    RAISE NOTICE 'Pedido de prueba creado con id %', v_pedido;
END $$;
