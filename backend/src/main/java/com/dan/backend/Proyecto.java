package com.dan.backend;

import jakarta.persistence.*;

@Entity
public class Proyecto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nombre;
    private String clave;

    public Long getId() { return id; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getClave() { return clave; }
    public void setClave(String clave) { this.clave = clave; }
}